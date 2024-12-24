import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlanService {
  constructor(private readonly prisma: PrismaService) {}

  // Fetch all plans
  async getAllPlans() {
    try {
      return await this.prisma.plan.findMany();
    } catch (error) {
      throw new BadRequestException('Error fetching plans');
    }
  }

  // Fetch plan by ID
  async getPlanById(id: number) {
    const plan = await this.prisma.plan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }

    return plan;
  }

  // Create a new plan
  async createPlan(createPlanDto: CreatePlanDto) {
    try {
      return await this.prisma.plan.create({
        data: createPlanDto,
      });
    } catch (error) {
      throw new BadRequestException('Error creating the plan');
    }
  }

  // Update plan details
  async updatePlan(id: number, updatePlanDto: UpdatePlanDto) {
    const plan = await this.prisma.plan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }

    try {
      return await this.prisma.plan.update({
        where: { id },
        data: updatePlanDto,
      });
    } catch (error) {
      throw new BadRequestException('Error updating the plan');
    }
  }

  // Delete plan
  async deletePlan(id: number) {
    const plan = await this.prisma.plan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }

    try {
      return await this.prisma.plan.delete({
        where: { id },
      });
    } catch (error) {
      throw new BadRequestException('Error deleting the plan');
    }
  }
}
