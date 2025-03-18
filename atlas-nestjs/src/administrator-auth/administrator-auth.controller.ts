import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  Request,
  UseGuards,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdministratorAuthService } from './administrator-auth.service';
import { LocalAuthGuard } from '../auth/guards/local-auth.guard';
import {
  AdminRegisterDto,
  AdminForgotPasswordDto,
  AdminResetPasswordDto,
  AdminChangePasswordDto,
  AdminProfileUpdateDto,
} from './dto';

@Controller('administrator')
export class AdministratorAuthController {
  constructor(private readonly AdministratorAuthService: AdministratorAuthService) {}

  @Post('register')
  async register(@Body() adminRegisterDto: AdminRegisterDto) {
    try {
      return await this.AdministratorAuthService.register(adminRegisterDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Administrator registration failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Request() req) {
    try {
      const result = await this.AdministratorAuthService.login(req.user);
      return {
        message: 'Administrator login successful',
        administrator: result.admin,
        access_token: result.access_token,
      };
    } catch (error) {
      throw new HttpException(
        'Administrator login failed',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Post('forgot-password')
  async forgotPassword(@Body() adminForgotPasswordDto: AdminForgotPasswordDto) {
    try {
      return await this.AdministratorAuthService.forgotPassword(adminForgotPasswordDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Forgot password failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('reset-password')
  async resetPassword(@Body() adminResetPasswordDto: AdminResetPasswordDto) {
    try {
      return await this.AdministratorAuthService.resetPassword(adminResetPasswordDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Reset password failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Body() adminChangePasswordDto: AdminChangePasswordDto,
    @Request() req,
  ) {
    try {
      return await this.AdministratorAuthService.changePassword(
        req.user,
        adminChangePasswordDto,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Change password failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Body() adminProfileUpdateDto: AdminProfileUpdateDto,
    @Request() req,
  ) {
    try {
      return await this.AdministratorAuthService.updateProfile(
        req.user,
        adminProfileUpdateDto,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Profile update failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    try {
      return await this.AdministratorAuthService.getProfile(req.user);
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || 'Failed to fetch profile',
      );
    }
  }

  @Get('all')
  @UseGuards(JwtAuthGuard)
  async getAllAdministrators() {
    try {
      return await this.AdministratorAuthService.getAllAdmins();
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch all administrators',
      );
    }
  }
}
