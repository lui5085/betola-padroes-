import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserUseCase } from '@betola/core/auth/use-cases/register-user-use-case';
import { AuthenticateUserUseCase } from '@betola/core/auth/use-cases/authenticate-user-use-case';
import { RequestPasswordResetUseCase } from '@betola/core/auth/use-cases/request-password-reset-use-case';
import { ResetPasswordUseCase } from '@betola/core/auth/use-cases/reset-password-use-case';
import { GetProfileUseCase } from '@betola/core/auth/use-cases/get-profile-use-case';
import { PrismaUsersRepository } from '@betola/adapters/auth/persistence/prisma-users-repository';
import { PrismaProfilesRepository } from '@betola/adapters/auth/persistence/prisma-profiles-repository';
import { BcryptHasher } from '@betola/adapters/auth/services/bcrypt-hasher';
import { PrismaService } from './infrastructure/database/prisma.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { Result } from '@betola/core/shared/application/result';
import { randomBytes } from 'crypto';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: any;
}

interface RefreshTokenResponse {
  accessToken: string;
  newRefreshToken: string;
}

@Injectable()
export class AuthService {
  private registerUserUseCase: RegisterUserUseCase;
  private authenticateUserUseCase: AuthenticateUserUseCase;
  private requestPasswordResetUseCase: RequestPasswordResetUseCase;
  private resetPasswordUseCase: ResetPasswordUseCase;
  private getProfileUseCase: GetProfileUseCase;
  private usersRepository: PrismaUsersRepository;
  private profilesRepository: PrismaProfilesRepository;

  constructor(
    private jwtService: JwtService,
    private prismaService: PrismaService,
  ) {
    // Inicializa repositórios e serviços
    this.usersRepository = new PrismaUsersRepository(this.prismaService);
    this.profilesRepository = new PrismaProfilesRepository();
    const hasher = new BcryptHasher();

    // Inicializa use cases
    this.registerUserUseCase = new RegisterUserUseCase(
      this.usersRepository,
      this.profilesRepository,
      hasher,
    );
    
    this.authenticateUserUseCase = new AuthenticateUserUseCase(
      this.usersRepository,
      hasher,
    );
    
    
    // this.requestPasswordResetUseCase = new RequestPasswordResetUseCase(
    //   this.usersRepository,
    // );
    
    this.resetPasswordUseCase = new ResetPasswordUseCase(
      this.usersRepository,
      hasher,
    );
    
    this.getProfileUseCase = new GetProfileUseCase(this.profilesRepository);
  }

  async register(dto: RegisterUserDto) {
    return this.registerUserUseCase.execute(dto);
  }

  async login(dto: LoginUserDto): Promise<Result<LoginResponse>> {
    const result = await this.authenticateUserUseCase.execute({
      email: dto.email,
      password: dto.password,
    });

    if (result.isFailure()) {
      return Result.failure(result.error);
    }

    const { user } = result.value;

    // Get additional user data including isAdmin from database
    const userId = typeof user.id === 'string' ? user.id : user.id.value;
    const userRecord = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });

    // Gera tokens
    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    // Prepare user object with admin status
    const userResponse = {
      id: userId,
      email: user.email.value || user.email,
      username: user.username.value || user.username,
      isAdmin: userRecord?.isAdmin || false,
      profile: (userRecord as any)?.profile ? {
        id: (userRecord as any).profile.id,
        displayName: (userRecord as any).profile.displayName,
        bio: (userRecord as any).profile.bio,
        avatarUrl: (userRecord as any).profile.avatarUrl,
        favoriteTeam: (userRecord as any).profile.favoriteTeam,
      } : null,
    };

    return Result.success({
      accessToken,
      refreshToken,
      user: userResponse,
    });
  }

  async refreshToken(refreshToken: string): Promise<Result<RefreshTokenResponse>> {
    try {
      // Verifica e decodifica o refresh token JWT
      const decoded = this.jwtService.verify(refreshToken) as any;
      
      if (!decoded.sub || decoded.type !== 'refresh') {
        return Result.failure('Invalid refresh token');
      }

      // Busca o usuário
      const user = await this.prismaService.user.findUnique({
        where: { id: decoded.sub }
      });

      if (!user) {
        return Result.failure('User not found');
      }

      // Gera novos tokens
      const accessToken = await this.generateAccessToken(user);
      const newRefreshToken = await this.generateRefreshToken(user);

      return Result.success({
        accessToken,
        newRefreshToken,
      });
    } catch (error) {
      return Result.failure('Invalid or expired refresh token');
    }
  }

  async revokeRefreshToken(): Promise<void> {
    // Com JWT stateless, não precisamos revogar tokens no banco
    // Eles expiram automaticamente baseado no tempo configurado
  }


  async requestPasswordReset(): Promise<void> {
    // Password reset functionality temporarily disabled
    throw new Error('Password reset functionality is temporarily disabled');
  }

  async resetPassword(token: string, newPassword: string) {
    return this.resetPasswordUseCase.execute({ token, newPassword });
  }

  async getProfile(userId: string) {
    try {
      const result = await this.getProfileUseCase.execute(userId);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(userId: string, updateData: { displayName?: string; bio?: string; favoriteTeam?: string; avatarUrl?: string }) {
    try {
      // For now, return a simple success response
      // In a full implementation, you would create an UpdateProfileUseCase
      const currentProfile = await this.getProfileUseCase.execute(userId);
      
      // Update the profile in the database directly for now
      const updatedProfile = await this.prismaService.profile.update({
        where: { userId },
        data: {
          displayName: updateData.displayName || currentProfile.profile.displayName,
          bio: updateData.bio || currentProfile.profile.bio,
          favoriteTeam: updateData.favoriteTeam || currentProfile.profile.favoriteTeam,
          avatarUrl: updateData.avatarUrl || currentProfile.profile.avatarUrl,
          updatedAt: new Date(),
        },
      });

      return Result.success(updatedProfile);
    } catch (error) {
      return Result.failure('Failed to update profile');
    }
  }

  private async generateAccessToken(user: any): Promise<string> {
    const userId = user.id?.value || user.id;
    const userEmail = user.email?.value || user.email;
    const userName = user.username?.value || user.username;

    if (!userId) {
      throw new Error('Cannot generate access token: user ID is missing');
    }

    const payload = {
      sub: userId,
      email: userEmail,
      username: userName,
    };

    return this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      secret: process.env.JWT_SECRET,
    });
  }

  private async generateRefreshToken(user: any): Promise<string> {
    const userId = user.id?.value || user.id;

    if (!userId) {
      throw new Error('Cannot generate refresh token: user ID is missing');
    }

    const payload = {
      sub: userId,
      type: 'refresh'
    };

    return this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      secret: process.env.JWT_SECRET,
    });
  }
}