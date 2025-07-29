import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LeagueService } from './league.service';
import { ChatMessageDto } from './dto/chat-message.dto';

@WebSocketGateway({
    namespace: 'leagues',
    cors: {
        origin: '*',
    },
})
export class LeagueChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(private readonly leagueService: LeagueService) { }

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('join_league')
    async handleJoinLeague(
        @MessageBody() data: { leagueId: string; userId: string },
        @ConnectedSocket() client: Socket,
    ) {
        try {
            // TODO: Validar se o usuário está na liga
            client.join(`league_${data.leagueId}`);
            client.emit('joined_league', { leagueId: data.leagueId });

            console.log(`User ${data.userId} joined league ${data.leagueId}`);
        } catch (error) {
            client.emit('error', { message: (error as Error).message });
        }
    }

    @SubscribeMessage('leave_league')
    async handleLeaveLeague(
        @MessageBody() data: { leagueId: string; userId: string },
        @ConnectedSocket() client: Socket,
    ) {
        try {
            client.leave(`league_${data.leagueId}`);
            client.emit('left_league', { leagueId: data.leagueId });

            console.log(`User ${data.userId} left league ${data.leagueId}`);
        } catch (error) {
            client.emit('error', { message: (error as Error).message });
        }
    }

      @SubscribeMessage('send_message')
  async handleSendMessage(
    @MessageBody() data: { leagueId: string; userId: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // TODO: Salvar mensagem no banco usando PrismaChatMessageRepository
      const messageData = {
        id: Date.now().toString(),
        leagueId: data.leagueId,
        userId: data.userId,
        message: data.message,
        createdAt: new Date(),
      };

      // Broadcast para todos os usuários na liga
      this.server.to(`league_${data.leagueId}`).emit('new_message', messageData);
      
      console.log(`Message sent to league ${data.leagueId}: ${data.message}`);
    } catch (error) {
      client.emit('error', { message: (error as Error).message });
    }
  }
} 