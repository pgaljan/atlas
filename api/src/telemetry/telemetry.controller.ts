import { Controller, Get, Query } from '@nestjs/common';
import { TelemetryService } from './telemetry.service';
import { parseISO } from 'date-fns';

@Controller('telemetry')
export class TelemetryController {
  constructor(private readonly telemetry: TelemetryService) {}

  @Get('current')
  async current() {
    const latest = await this.telemetry.getLatest();
    return { data: latest };
  }

  @Get('history')
  async history(@Query('from') from: string, @Query('to') to: string) {
    const fromDate = from
      ? parseISO(from)
      : new Date(Date.now() - 14 * 24 * 3600 * 1000);
    const toDate = to ? parseISO(to) : new Date();
    const rows = await this.telemetry.getHistory(fromDate, toDate);
    return { data: rows };
  }
  @Get('average')
  async average(@Query('days') days?: string) {
    const numDays = days ? parseInt(days, 10) : 14;
    return this.telemetry.getAverages(numDays);
  }
}
