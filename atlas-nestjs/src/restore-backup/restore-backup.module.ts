import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RestoreController } from './restore-backup.controller';
import { RestoreService } from './restore-backup.service';

@Module({
  imports: [PrismaModule],
  controllers: [RestoreController],
  providers: [RestoreService],
})
export class RestoreBackupModule {}
