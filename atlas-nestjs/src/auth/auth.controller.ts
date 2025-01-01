import {
  BadRequestException,
  Body,
  Controller,
  InternalServerErrorException,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    try {
      const response = await this.authService.register(registerDto);
      return {
        message: 'User registered successfully',
      };
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
        message: response.message,
        user: response.user,
        access_token: response.access_token,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException(
          'Login failed. Invalid credentials. Please check your credentials and try again.',
        );
      }
      throw new InternalServerErrorException(
        'Login failed due to an unexpected error.',
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
}
