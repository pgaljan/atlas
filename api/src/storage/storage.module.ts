import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageAccountingService } from './storage-accounting.service';

@Module({
  imports: [PrismaModule],                
  providers: [StorageAccountingService],
  exports: [StorageAccountingService],    
})
export class StorageModule {}
