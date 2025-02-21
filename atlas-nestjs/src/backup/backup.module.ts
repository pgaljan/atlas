import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { BackupController } from './backup.controller';
import { BackupService } from './backup.service';
import { FeatureFlagMiddleware } from 'src/auth/middleware/feature.flag.middleware';

@Module({
  imports: [PrismaModule],
  providers: [BackupService],
  controllers: [BackupController],
})
export class BackupModule {}

