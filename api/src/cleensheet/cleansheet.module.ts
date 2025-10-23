import { Module } from '@nestjs/common';
import { CleansheetController } from './cleansheet.controller';
import { CleansheetService } from './cleansheet.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [CleansheetController],
  providers: [CleansheetService, PrismaService],
})
export class CleansheetModule {}
