import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { CreateTermsOfConditions } from './dto/create-terms-of-service.dto';
import { TermsOfServiceService } from './terms-of-service.service';

@Controller('terms-of-service')
export class TermsOfServiceController {
  constructor(private readonly termsOfServiceService: TermsOfServiceService) {}

  // Single Create or Update API
  @Post('save')
  async createOrUpdateTerms(
    @Body() CreateTermsOfConditions: CreateTermsOfConditions,
  ) {
    try {
      const terms = await this.termsOfServiceService.createOrUpdateTerms(
        CreateTermsOfConditions,
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

  // Separate Get API
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

  // Delete Terms of Service
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
}
