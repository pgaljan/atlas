import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  // Get a subscription by user ID
  async getSubscriptionByUserId(userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true }, 
    });

    if (!subscription) {
      throw new NotFoundException(
        `Subscription for user ID ${userId} not found`,
      );
    }

    return subscription;
  }

  // Update planId of a subscription
  async updatePlan(userId: string, planId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      throw new NotFoundException(
        `Subscription for user ID ${userId} not found`,
      );
    }

    try {
      return await this.prisma.subscription.update({
        where: { userId },
        data: { planId },
      });
    } catch (error) {
      throw new BadRequestException('Error updating subscription plan');
    }
  }
}
