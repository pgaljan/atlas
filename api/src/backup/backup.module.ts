import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { BackupController } from './backup.controller';
import { BackupService } from './backup.service';
import { StorageModule } from 'src/storage/storage.module';
import { AzureBlobService } from 'src/azure-blob-storage/azure-blob.service';

@Module({
  imports: [PrismaModule, StorageModule],
  providers: [BackupService, AzureBlobService],
  controllers: [BackupController],
  exports: [BackupService],
})
export class BackupModule {}
