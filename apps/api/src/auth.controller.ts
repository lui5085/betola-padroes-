import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Put,
  Req,
  Res,
  HttpStatus,
  HttpException,
  UseInterceptors,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from './modules/auth/decorators/current-user.decorator';
import { UserPayload } from './modules/auth/types/user-payload';

@Controller('auth')
@UseInterceptors(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() registerUserDto: RegisterUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.register(registerUserDto);
    
    if (result.isFailure()) {
      throw new HttpException(result.error, HttpStatus.BAD_REQUEST);
    }

    const { user, profile } = result.value;
    
    return {
      message: 'Registration successful.',
      user: {
        id: user.id.value,
        email: user.email.value,
        username: user.username.value,
      },
      profile: {
        id: profile.id.value,
        displayName: profile.displayName,
      },
    };
  }

  @Post('login')
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(loginUserDto);
    
    if (result.isFailure()) {
      throw new HttpException(result.error, HttpStatus.UNAUTHORIZED);
    }

    const { accessToken, refreshToken, user } = result.value;

    // Define cookies httpOnly
    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutos
    });

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    });

    return {
      user: {
        id: user.id.value,
        email: user.email.value,
        username: user.username.value,
      },
      // Include access token for WebSocket authentication
      // Since WebSocket can't access httpOnly cookies
      accessToken: accessToken,
    };
  }

  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies?.refreshToken;
    
    if (!refreshToken) {
      throw new HttpException('Refresh token not provided', HttpStatus.UNAUTHORIZED);
    }

    const result = await this.authService.refreshToken(refreshToken);
    
    if (result.isFailure()) {
      throw new HttpException(result.error, HttpStatus.UNAUTHORIZED);
    }

    const { accessToken, newRefreshToken } = result.value;

    // Atualiza cookies
    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutos
    });

    response.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    });

    return { message: 'Token refreshed successfully' };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(
    @CurrentUser() user: UserPayload,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies?.refreshToken;
    
    if (refreshToken) {
      await this.authService.revokeRefreshToken();
    }

    // Limpa cookies
    response.clearCookie('accessToken');
    response.clearCookie('refreshToken');

    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: UserPayload) {
    const profileResult = await this.authService.getProfile(user.id);
    
    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      profile: profileResult.profile,
    };
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @CurrentUser() user: UserPayload,
    @Body() updateData: { displayName?: string; bio?: string; favoriteTeam?: string; avatarUrl?: string }
  ) {
    const result = await this.authService.updateProfile(user.id, updateData);
    
    if (result.isFailure()) {
      throw new HttpException(result.error, HttpStatus.BAD_REQUEST);
    }

    return {
      message: 'Profile updated successfully',
      profile: result.value,
    };
  }


  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    try {
      await this.authService.requestPasswordReset();
      return { message: 'Password reset email sent' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    const result = await this.authService.resetPassword(body.token, body.newPassword);
    
    if (result.isFailure()) {
      throw new HttpException(result.error, HttpStatus.BAD_REQUEST);
    }

    return { message: 'Password reset successfully' };
  }
}