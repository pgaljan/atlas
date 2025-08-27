import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { StructureController } from './structure.controller';
import { StructureService } from './structure.service';

@Module({
  imports: [PrismaModule],
  controllers: [StructureController],
  providers: [StructureService],
})
export class StructureModule {}