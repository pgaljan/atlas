import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { FileUploadController } from './file-upload.controller';
import { FileUploadService } from './file-upload.service';
import { StorageModule } from 'src/storage/storage.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot(), 
    StorageModule
  ],
  controllers: [FileUploadController],
  providers: [FileUploadService],
})

export class FileUploadModule {}
