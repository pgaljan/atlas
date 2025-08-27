import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTermsOfConditions } from './dto/create-terms-of-service.dto';

@Injectable()
export class TermsOfServiceService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrUpdateTerms(createTermsOfConditions: CreateTermsOfConditions) {
    const { content } = createTermsOfConditions;
    try {
      const existingTerms = await this.prisma.termsOfService.findFirst();

      if (existingTerms) {
        return await this.prisma.termsOfService.update({
          where: { id: existingTerms.id },
          data: {
            content,
            updatedAt: new Date(),
          },
        });
      }

      return await this.prisma.termsOfService.create({
        data: { content },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create or update terms of service: ${error.message}`,
      );
    }
  }

  async getTerms() {
    try {
      const terms = await this.prisma.termsOfService.findFirst();
      if (!terms) {
        throw new NotFoundException('No terms of service found');
      }
      return terms;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to retrieve terms of service: ${error.message}`,
      );
    }
  }

  async remove(id: string) {
    try {
      const terms = await this.prisma.termsOfService.findUnique({
        where: { id },
      });
      if (!terms) {
        throw new NotFoundException(
          `Terms of service with id "${id}" not found`,
        );
      }

      await this.prisma.termsOfService.delete({ where: { id } });
      return { message: 'Terms of service deleted successfully' };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to delete terms of service: ${error.message}`,
      );
    }
  }

  async checkTermsStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    const latestTerms = await this.prisma.termsOfService.findFirst({
      orderBy: { updatedAt: 'desc' },
    });

    if (!latestTerms) {
      return {
        showTermsModal: false,
        terms: null,
      };
    }

    const showTermsModal =
      !user?.termsAcceptedAt || user.termsAcceptedAt < latestTerms.updatedAt;

    return {
      showTermsModal,
      terms: latestTerms,
    };
  }

  async acceptTerms(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { termsAcceptedAt: new Date() },
    });

    return { message: 'Terms accepted successfully' };
  }
}
