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

  // Create or Update Terms of Service
  async createOrUpdateTerms(createTermsOfConditions: CreateTermsOfConditions) {
    const { content } = createTermsOfConditions;
    try {
      const existingTerms = await this.prisma.termsOfService.findFirst();

      if (existingTerms) {
        // Update existing Terms of Service
        const updatedTerms = await this.prisma.termsOfService.update({
          where: { id: existingTerms.id },
          data: {
            content,
            updatedAt: new Date(),
          },
        });
        return updatedTerms;
      } else {
        // Create new Terms of Service
        const newTerms = await this.prisma.termsOfService.create({
          data: {
            content,
          },
        });
        return newTerms;
      }
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create or update terms of service: ${error.message}`,
      );
    }
  }

  // Get Terms of Service
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

  // Remove Terms of Service (delete)
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

      await this.prisma.termsOfService.delete({
        where: { id },
      });

      return { message: 'Terms of service deleted successfully' };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to delete terms of service: ${error.message}`,
      );
    }
  }
}
