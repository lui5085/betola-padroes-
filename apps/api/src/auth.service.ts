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

    // Gera tokens
    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    // Salva refresh token no banco
    await this.saveRefreshToken(user.id.value, refreshToken);

    return Result.success({
      accessToken,
      refreshToken,
      user,
    });
  }

  async refreshToken(refreshToken: string): Promise<Result<RefreshTokenResponse>> {
    try {
      // Verifica se o refresh token existe e é válido
      const storedToken = await (this.prismaService as any).refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!storedToken || storedToken.revokedAt) {
        return Result.failure('Invalid refresh token');
      }

      if (new Date() > storedToken.expiresAt) {
        return Result.failure('Refresh token expired');
      }

      // Revoga o token antigo
      await (this.prismaService as any).refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt: new Date() },
      });

      // Gera novos tokens
      const accessToken = await this.generateAccessToken(storedToken.user);
      const newRefreshToken = await this.generateRefreshToken(storedToken.user);

      // Salva novo refresh token
      await this.saveRefreshToken(storedToken.userId, newRefreshToken);

      return Result.success({
        accessToken,
        newRefreshToken,
      });
    } catch (error) {
      return Result.failure('Failed to refresh token');
    }
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    await (this.prismaService as any).refreshToken.updateMany({
      where: { token: refreshToken },
      data: { revokedAt: new Date() },
    });
  }


  async requestPasswordReset(email: string) {
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

  private async generateAccessToken(user: any): Promise<string> {
    const payload = {
      sub: user.id.value,
      email: user.email.value,
      username: user.username.value,
    };

    return this.jwtService.sign(payload, {
      expiresIn: '15m',
      secret: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET,
    });
  }

  private async generateRefreshToken(user: any): Promise<string> {
    const token = randomBytes(32).toString('hex');
    return token;
  }

  private async saveRefreshToken(userId: string, token: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias

    await (this.prismaService as any).refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });
  }
}