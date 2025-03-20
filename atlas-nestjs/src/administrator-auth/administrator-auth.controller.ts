import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  Request,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Param,
  Delete,
} from '@nestjs/common';
import { AdministratorAuthService } from './administrator-auth.service';
import {
  AdminRegisterDto,
  AdminForgotPasswordDto,
  AdminResetPasswordDto,
  AdminChangePasswordDto,
  AdminProfileUpdateDto,
} from './dto';

@Controller('administrator')
export class AdministratorAuthController {
  constructor(
    private readonly AdministratorAuthService: AdministratorAuthService,
  ) {}

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
  async login(@Request() req) {
    try {
      const result = await this.AdministratorAuthService.login(req.body);
      return {
        message: 'SuperAdmin login successful',
        superAdmin: result.superAdmin,
        access_token: result.access_token,
      };
    } catch (error) {
      throw new HttpException(
        'SuperAdmin login failed',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Post('forgot-password')
  async forgotPassword(@Body() adminForgotPasswordDto: AdminForgotPasswordDto) {
    try {
      return await this.AdministratorAuthService.forgotPassword(
        adminForgotPasswordDto,
      );
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
      return await this.AdministratorAuthService.resetPassword(
        adminResetPasswordDto,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Reset password failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('change-password')
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

  @Delete(':id')
  async deleteAdministrator(@Param('id') id: string) {
    try {
      return await this.AdministratorAuthService.deleteAdministrator(id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete administrator',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('profile/:id')
  async updateProfile(
    @Param('id') id: string,
    @Body() adminProfileUpdateDto: AdminProfileUpdateDto,
  ) {
    try {
      return await this.AdministratorAuthService.updateProfile(
        id,
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
