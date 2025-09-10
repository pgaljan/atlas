import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RecordController } from './record.controller';
import { RecordService } from './record.service';

@Module({
  imports: [PrismaModule],
  providers: [RecordService],
  controllers: [RecordController],
})
export class RecordModule {}
