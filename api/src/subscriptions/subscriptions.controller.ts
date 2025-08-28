import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  // Get subscription by user ID
  @Get(':userId')
  async getSubscriptionByUserId(@Param('userId') userId: string) {
    try {
      return await this.subscriptionsService.getSubscriptionByUserId(userId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error fetching subscription');
    }
  }

  // Update subscription planId
  @Patch(':userId/plan')
  async updateSubscriptionPlan(
    @Param('userId') userId: string,
    @Body('planId') planId: string,
  ) {
    if (!planId) {
      throw new BadRequestException('Plan ID is required');
    }

    try {
      return await this.subscriptionsService.updatePlan(userId, planId);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Error updating subscription plan');
    }
  }
}
