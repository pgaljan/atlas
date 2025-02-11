import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { StructureController } from './structure.controller';
import { StructureService } from './structure.service';
import { FeatureFlagMiddleware } from '../auth/middleware/feature.flag.middleware';

@Module({
  imports: [PrismaModule],
  controllers: [StructureController],
  providers: [StructureService],
})
export class StructureModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(FeatureFlagMiddleware).forRoutes('structure/create');
  }
}
