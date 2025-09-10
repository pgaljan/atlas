import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePolicyDto } from './dto/create-policy.dto';

@Injectable()
export class PolicyService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrUpdatePolicy(createPolicyDto: CreatePolicyDto) {
    const { content } = createPolicyDto;
    try {
      const existingPolicy = await this.prisma.privacyPolicy.findFirst();

      if (existingPolicy) {
        const updatedPolicy = await this.prisma.privacyPolicy.update({
          where: { id: existingPolicy.id },
          data: {
            content,
            updatedAt: new Date(),
          },
        });
        return updatedPolicy;
      } else {
        const newPolicy = await this.prisma.privacyPolicy.create({
          data: {
            content,
          },
        });
        return newPolicy;
      }
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create or update policy: ${error.message}`,
      );
    }
  }

  // Get Policy (latest or first one)
  async getPolicy() {
    try {
      const policy = await this.prisma.privacyPolicy.findFirst();
      if (!policy) {
        throw new NotFoundException('No policy found');
      }
      return policy;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to retrieve policy: ${error.message}`,
      );
    }
  }

  // Check if user needs to accept the updated policy based on their last login
  async checkIfUserNeedsToAcceptPolicy(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { policyAcceptedAt: true },
    });

    const latestPolicy = await this.prisma.privacyPolicy.findFirst({
      orderBy: { updatedAt: 'desc' },
    });

    if (!user || !latestPolicy) {
      throw new NotFoundException('User or Policy not found');
    }

    // If user never accepted any policy, they need to accept the latest
    if (!user.policyAcceptedAt) {
      return true;
    }

    // If policy was updated after user accepted it, show modal
    return latestPolicy.updatedAt > user.policyAcceptedAt;
  }

  async acknowledgePolicy(userId: string) {
    const latestPolicy = await this.prisma.privacyPolicy.findFirst({
      orderBy: { updatedAt: 'desc' },
    });

    if (!latestPolicy) {
      throw new NotFoundException('No privacy policy found to acknowledge');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        policyAcceptedAt: new Date(),
        acceptedPrivacyPolicyId: latestPolicy.id,
      },
    });

    return { message: 'Privacy policy acknowledged' };
  }
}
