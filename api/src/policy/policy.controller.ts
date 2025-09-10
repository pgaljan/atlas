import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { PolicyService } from './policy.service';

@Controller('policy')
export class PolicyController {
  constructor(private readonly policyService: PolicyService) {}

  // Single Create or Update API
  @Post('save')
  async createOrUpdatePolicy(@Body() createPolicyDto: CreatePolicyDto) {
    try {
      const policy =
        await this.policyService.createOrUpdatePolicy(createPolicyDto);
      return {
        message: 'Policy saved successfully',
        policy,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to save policy: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Separate Get API
  @Get()
  async getPolicy() {
    try {
      const policy = await this.policyService.getPolicy();
      return {
        message: 'Policy retrieved successfully',
        policy,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to retrieve policy: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Check if user needs to accept the policy
  @Get('check-acceptance/:userId')
  async checkIfUserNeedsToAcceptPolicy(@Param('userId') userId: string) {
    try {
      const needsToAccept =
        await this.policyService.checkIfUserNeedsToAcceptPolicy(userId);
      return {
        message: 'Policy acceptance check completed',
        needsToAccept,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to check policy acceptance: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Accept the policy
  @Post('acknowledge/:userId')
  async acknowledgePolicy(@Param('userId') userId: string) {
    try {
      const result = await this.policyService.acknowledgePolicy(userId);
      return result;
    } catch (error) {
      throw new HttpException(
        `Failed to acknowledge policy: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
