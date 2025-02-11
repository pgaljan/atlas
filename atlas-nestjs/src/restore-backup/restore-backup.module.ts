import { MiddlewareConsumer, Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RestoreController } from './restore-backup.controller';
import { RestoreService } from './restore-backup.service';
import { FeatureFlagMiddleware } from 'src/auth/middleware/feature.flag.middleware';

@Module({
  imports: [PrismaModule],
  controllers: [RestoreController],
  providers: [RestoreService],
})
export class RestoreBackupModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(FeatureFlagMiddleware).forRoutes('restore/file');
  }
}
