import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3005',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private connectedUsers = new Map<string, AuthenticatedSocket>();

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    try {
      this.logger.log(`Client attempting to connect: ${client.id}`);
      
      // Get token from handshake auth or query
      const token = 
        client.handshake?.auth?.token || 
        client.handshake?.query?.token;

      this.logger.debug(`Token received: ${token ? 'Present' : 'Not present'} for client ${client.id}`);
      this.logger.debug(`Auth object:`, client.handshake?.auth);

      if (!token) {
        this.logger.warn(`No token provided: ${client.id}`);
        client.disconnect();
        return;
      }

      // Validate token format
      if (typeof token !== 'string' || token.length < 10) {
        this.logger.warn(`Invalid token format: ${client.id} - token: ${token}`);
        client.disconnect();
        return;
      }

      try {
        // Verify JWT token
        const payload = this.jwtService.verify(token);
        
        if (!payload.sub) {
          this.logger.warn(`Invalid token payload: ${client.id}`);
          client.disconnect();
          return;
        }

        // Get user from database
        const user = await this.prisma.user.findUnique({
          where: { id: payload.sub },
          include: {
            profile: true,
          },
        });

        if (!user) {
          this.logger.warn(`User not found: ${client.id}`);
          client.disconnect();
          return;
        }

        // Attach user info to socket
        client.userId = user.id;
        client.username = user.username;

        this.connectedUsers.set(client.userId, client);
        this.logger.log(`User ${client.username} (${client.userId}) connected`);
        
        // Debug: Verify user info was attached
        this.logger.debug(`Post-auth verification - Client ${client.id}: userId=${client.userId}, username=${client.username}`);
        
      } catch (jwtError) {
        this.logger.warn(`JWT verification failed: ${client.id} - ${jwtError.message}`);
        client.disconnect();
        return;
      }
      
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.connectedUsers.delete(client.userId);
      this.logger.log(`User ${client.username} (${client.userId}) disconnected`);
    }
  }

  @SubscribeMessage('joinLeague')
  async handleJoinLeague(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { leagueId: string }
  ) {
    try {
      const { leagueId } = data;
      
      this.logger.debug(`joinLeague called - Client ID: ${client.id}, userId: ${client.userId}, username: ${client.username}`);
      
      if (!client.userId) {
        this.logger.warn(`joinLeague failed - Client ${client.id} has no userId attached`);
        this.logger.debug(`Connection state - connectedUsers has ${this.connectedUsers.size} users`);
        this.logger.debug(`Client properties:`, {
          id: client.id,
          userId: client.userId,
          username: client.username,
          connected: client.connected,
          handshake: {
            auth: client.handshake?.auth,
            query: client.handshake?.query
          }
        });
        client.emit('error', { message: 'User not authenticated' });
        return;
      }
      
      // Verify user is member of the league
      const isMember = await this.chatService.isUserMemberOfLeague(client.userId, leagueId);
      if (!isMember) {
        client.emit('error', { message: 'Not a member of this league' });
        return;
      }

      // Join the league room
      await client.join(`league:${leagueId}`);
      
      // Get recent messages
      const messages = await this.chatService.getRecentMessages(leagueId, 50);
      
      client.emit('joinedLeague', { 
        leagueId, 
        messages: messages.map(msg => ({
          id: msg.id,
          content: msg.content,
          type: msg.type,
          createdAt: msg.createdAt,
          user: {
            id: msg.user.id,
            username: msg.user.username,
            profile: msg.user.profile
          }
        }))
      });

      // Notify others in the league
      client.to(`league:${leagueId}`).emit('userJoinedChat', {
        userId: client.userId,
        username: client.username
      });

      this.logger.log(`User ${client.username} joined league ${leagueId}`);
      
    } catch (error) {
      this.logger.error(`Error joining league: ${error.message}`);
      client.emit('error', { message: 'Failed to join league chat' });
    }
  }

  @SubscribeMessage('leaveLeague')
  async handleLeaveLeague(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { leagueId: string }
  ) {
    const { leagueId } = data;
    
    await client.leave(`league:${leagueId}`);
    
    // Notify others in the league
    client.to(`league:${leagueId}`).emit('userLeftChat', {
      userId: client.userId,
      username: client.username
    });

    client.emit('leftLeague', { leagueId });
    this.logger.log(`User ${client.username} left league ${leagueId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { leagueId: string; content: string; type?: string }
  ) {
    try {
      const { leagueId, content, type = 'TEXT' } = data;

      this.logger.debug(`sendMessage called - Client ID: ${client.id}, userId: ${client.userId}, username: ${client.username}`);

      if (!client.userId) {
        this.logger.warn(`sendMessage failed - Client ${client.id} has no userId attached`);
        client.emit('error', { message: 'User not authenticated' });
        return;
      }

      // Validate message content
      if (!content || content.trim().length === 0) {
        client.emit('error', { message: 'Message content cannot be empty' });
        return;
      }

      if (content.length > 1000) {
        client.emit('error', { message: 'Message too long' });
        return;
      }

      // Verify user is member of the league
      const isMember = await this.chatService.isUserMemberOfLeague(client.userId, leagueId);
      if (!isMember) {
        client.emit('error', { message: 'Not a member of this league' });
        return;
      }

      // Save message to database
      const savedMessage = await this.chatService.saveMessage({
        leagueId,
        userId: client.userId,
        content: content.trim(),
        type,
      });

      // Prepare message for broadcast
      const messagePayload = {
        id: savedMessage.id,
        content: savedMessage.content,
        type: savedMessage.type,
        createdAt: savedMessage.createdAt,
        user: {
          id: savedMessage.user.id,
          username: savedMessage.user.username,
          profile: savedMessage.user.profile
        }
      };

      // Broadcast to all users in the league
      this.server.to(`league:${leagueId}`).emit('newMessage', messagePayload);

      this.logger.log(`Message sent by ${client.username} in league ${leagueId}`);
      
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`);
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { leagueId: string; isTyping: boolean }
  ) {
    const { leagueId, isTyping } = data;
    
    client.to(`league:${leagueId}`).emit('userTyping', {
      userId: client.userId,
      username: client.username,
      isTyping
    });
  }

  // Method to send system messages (bet notifications, etc.)
  async sendSystemMessage(leagueId: string, content: string, metadata?: any) {
    const systemMessage = await this.chatService.saveSystemMessage(
      leagueId,
      content,
      metadata
    );

    this.server.to(`league:${leagueId}`).emit('newMessage', {
      id: systemMessage.id,
      content: systemMessage.content,
      type: systemMessage.type,
      createdAt: systemMessage.createdAt,
      metadata: systemMessage.metadata,
      user: {
        id: 'system',
        username: 'Sistema',
        profile: null
      }
    });
  }
}