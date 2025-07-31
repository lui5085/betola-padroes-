import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    console.log('AdminGuard - User from request:', user);

    if (!user || !user.id) {
      console.log('AdminGuard - User not authenticated');
      throw new ForbiddenException('User not authenticated');
    }

    // Verificar se o usuário é admin no banco
    const userRecord = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, username: true, isAdmin: true }
    });

    console.log('AdminGuard - User record from DB:', userRecord);

    if (!userRecord?.isAdmin) {
      console.log('AdminGuard - User is not admin');
      throw new ForbiddenException('Admin access required');
    }

    console.log('AdminGuard - Access granted for admin user');
    return true;
  }
}