import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Req,
  Request,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request as ExpressRequest, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { GoogleOauthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { GitHubOauthGuard } from './guards/github-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    try {
      const result = await this.authService.register(registerDto);
      return result;
    } catch (error) {
      if (error.name === 'ConflictException') {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while registering the user',
      );
    }
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Request() req: ExpressRequest) {
    try {
      const response = await this.authService.login(req.user);
      return {
        message: 'Login successful',
        user: response.user,
        access_token: response.access_token,
      };
    } catch (error) {
      throw new UnauthorizedException(
        'Login failed. Please check your credentials and try again.',
      );
    }
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    try {
      const response = await this.authService.resetPassword(resetPasswordDto);
      return {
        message: 'Password reset successfully',
        access_token: response.access_token,
      };
    } catch (error) {
      if (error.name === 'ConflictException') {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while resetting the password',
      );
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req: ExpressRequest) {
    try {
      await this.authService.logout(req.user);
      return {
        message: 'Logout successful',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'An unexpected error occurred while logging out',
      );
    }
  }

  @Get('google')
  @UseGuards(GoogleOauthGuard)
  async auth() {}

  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  async googleAuthCallback(@Req() req: ExpressRequest, @Res() res: Response) {
    try {
      await this.authService.googleLogin(req.user, res);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Google authentication failed',
        error: error.message,
      });
    }
  }

  @Get('github')
  @UseGuards(GitHubOauthGuard)
  async authGitHub() {}

  @Get('github/callback')
  @UseGuards(GitHubOauthGuard)
  async githubAuthCallback(@Req() req: ExpressRequest, @Res() res: Response) {
    try {
      await this.authService.githubLogin(req.user, res);
    } catch (error) {
      console.log(error)
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'GitHub authentication failed',
        error: error.message,
      });
    }
  }
}
