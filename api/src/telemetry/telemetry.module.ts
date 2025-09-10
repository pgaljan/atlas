import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../prisma/prisma.module';
import { TelemetryCleanupService } from './telemetry.cleanup.service';
import { TelemetryController } from './telemetry.controller';
import { TelemetryService } from './telemetry.service';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule],
  providers: [TelemetryService, TelemetryCleanupService],
  controllers: [TelemetryController],
  exports: [TelemetryService],
})
export class TelemetryModule {}
