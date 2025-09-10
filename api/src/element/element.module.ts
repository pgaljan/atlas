import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ElementController } from './element.controller';
import { ElementService } from './element.service';

@Module({
  imports: [PrismaModule],
  providers: [ElementService],
  controllers: [ElementController],
})
export class ElementModule {}
