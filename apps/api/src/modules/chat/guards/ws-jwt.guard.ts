import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: AuthenticatedSocket = context.switchToWs().getClient();
      
      // Get token from handshake auth or query
      const token = 
        client.handshake?.auth?.token || 
        client.handshake?.query?.token;

      if (!token) {
        return false;
      }

      // Verify JWT token
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET
      });
      
      if (!payload.sub) {
        return false;
      }

      // Get user from database
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          profile: true,
        },
      });

      if (!user) {
        return false;
      }

      // Attach user info to socket
      client.userId = user.id;
      client.username = user.username;

      return true;
    } catch (error) {
      return false;
    }
  }
}