import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TelemetryCleanupService {
  private readonly logger = new Logger(TelemetryCleanupService.name);
  constructor(private readonly prisma: PrismaService) {}

  @Cron('0 3 * * *')
  async dailyRetention() {
    const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const { count } = await this.prisma.metric.deleteMany({
      where: { timestamp: { lt: cutoff } },
    });
    this.logger.log(
      `Telemetry retention: deleted ${count} old metric rows older than ${cutoff.toISOString()}`,
    );
  }
}
