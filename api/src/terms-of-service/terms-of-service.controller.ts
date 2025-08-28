import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { CreateTermsOfConditions } from './dto/create-terms-of-service.dto';
import { TermsOfServiceService } from './terms-of-service.service';

@Controller('terms-of-service')
export class TermsOfServiceController {
  constructor(private readonly termsOfServiceService: TermsOfServiceService) {}

  @Post('save')
  async createOrUpdateTerms(
    @Body() createTermsOfConditions: CreateTermsOfConditions,
  ) {
    try {
      const terms = await this.termsOfServiceService.createOrUpdateTerms(
        createTermsOfConditions,
      );
      return {
        message: 'Terms of service saved successfully',
        terms,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to save terms of service: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async getTerms() {
    try {
      const terms = await this.termsOfServiceService.getTerms();
      return {
        message: 'Terms of service retrieved successfully',
        terms,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to retrieve terms of service: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('remove/:id')
  async removeTerms(@Param('id') id: string) {
    try {
      const response = await this.termsOfServiceService.remove(id);
      return response;
    } catch (error) {
      throw new HttpException(
        `Failed to delete terms of service: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('check-terms-status/:userId')
  async checkTermsStatus(@Param('userId') userId: string) {
    try {
      return await this.termsOfServiceService.checkTermsStatus(userId);
    } catch (error) {
      console.log(error);
      throw new HttpException(
        `Failed to check terms status: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('accept-terms/:userId')
  async acceptTerms(@Param('userId') userId: string) {
    try {
      return await this.termsOfServiceService.acceptTerms(userId);
    } catch (error) {
      throw new HttpException(
        `Failed to accept terms: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
