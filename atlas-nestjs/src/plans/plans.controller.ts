import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { PlanService } from './plans.service';

@Controller('plans')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  // Get all plans
  // @UseGuards(JwtAuthGuard)
  @Get()
  async getAllPlans() {
    try {
      return await this.planService.getAllPlans();
    } catch (error) {
      throw new BadRequestException('Error fetching plans');
    }
  }

  // Get plan by ID
  @Get(':id')
  async getPlanById(@Param('id') id: string) {
    try {
      return await this.planService.getPlanById(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error retrieving plan');
    }
  }

  // Create a new plan
  @Post('create')
  async createPlan(@Body() createPlanDto: CreatePlanDto) {
    try {
      return await this.planService.createPlan(createPlanDto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error creating plan');
    }
  }

  // Update plan details
  @Patch('update/:id')
  async updatePlan(
    @Param('id') id: string,
    @Body() updatePlanDto: UpdatePlanDto,
  ) {
    try {
      return await this.planService.updatePlan(id, updatePlanDto);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Error updating plan');
    }
  }

  // Delete a plan
  @Delete('delete/:id')
  async deletePlan(@Param('id') id: string) {
    try {
      return await this.planService.deletePlan(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error deleting plan');
    }
  }
}
