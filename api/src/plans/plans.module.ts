import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PlanController } from './plans.controller';
import { PlanService } from './plans.service';

@Module({
  imports: [PrismaModule],
  providers: [PlanService],
  controllers: [PlanController],
})
export class PlansModule {}
