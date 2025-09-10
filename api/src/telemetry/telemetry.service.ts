import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { MeterProvider } from '@opentelemetry/sdk-metrics';
import { ObservableResult } from '@opentelemetry/api';

import * as os from 'os';
import * as si from 'systeminformation';
import * as disk from 'diskusage';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TelemetryService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelemetryService.name);
  private meterProvider: MeterProvider;
  private intervalHandle: NodeJS.Timeout | null = null;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lifecycle hook: initialize telemetry
   */
  async onModuleInit() {
    this.setupOpenTelemetryMeter();

    // Run every 60 seconds
    this.intervalHandle = setInterval(
      () => this.persistSnapshot().catch((err) => this.logger.error(err)),
      60_000,
    );

    await this.persistSnapshot().catch((err) =>
      this.logger.error('Initial telemetry snapshot failed:', err),
    );

    this.logger.log('Telemetry module initialized.');
  }

  /**
   * Lifecycle hook: clean up when module destroyed
   */
  onModuleDestroy() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
    }
  }

  /**
   * Setup OpenTelemetry Metrics
   */
  private setupOpenTelemetryMeter() {
    this.meterProvider = new MeterProvider();
    const meter = this.meterProvider.getMeter('platform-metrics');

    // CPU Utilization
    meter
      .createObservableGauge('cpu.utilization', {
        description: 'CPU utilization percentage (0-100)',
      })
      .addCallback(async (obs: ObservableResult) => {
        const cpuInfo = await si.currentLoad();
        obs.observe(cpuInfo.currentLoad); // already a percentage
      });

    // Memory
    meter.createObservableGauge('memory.used.gib').addCallback((obs) => {
      obs.observe((os.totalmem() - os.freemem()) / 1024 ** 3);
    });

    meter.createObservableGauge('memory.total.gib').addCallback((obs) => {
      obs.observe(os.totalmem() / 1024 ** 3);
    });

    // Disk Usage
    const rootPath = os.platform() === 'win32' ? 'c:' : '/';
    meter.createObservableGauge('disk.used.gib').addCallback((obs) => {
      try {
        const { total, available } = disk.checkSync(rootPath);
        const used = (total - available) / 1024 ** 3;
        obs.observe(used);
      } catch (err) {
        this.logger.warn('Disk usage check failed', err);
        obs.observe(0);
      }
    });

    meter.createObservableGauge('disk.total.gib').addCallback((obs) => {
      try {
        const { total } = disk.checkSync(rootPath);
        obs.observe(total / 1024 ** 3);
      } catch (err) {
        obs.observe(0);
      }
    });

    this.logger.log('OpenTelemetry meter initialized for platform metrics');
  }

  /**
   * Persist snapshot to database
   */
  private async persistSnapshot() {
    // --- CPU
    const cpuInfo = await si.currentLoad();
    const cpuPct = parseFloat(cpuInfo.currentLoad.toFixed(2));

    // --- Memory
    const totalMem = os.totalmem() / 1024 ** 3;
    const usedMem = (os.totalmem() - os.freemem()) / 1024 ** 3;
    const memPct = parseFloat(((usedMem / totalMem) * 100).toFixed(2));

    // --- Disk
    const rootPath = os.platform() === 'win32' ? 'c:' : '/';
    let diskUsed = 0;
    let diskTotal = 0;
    let diskPct = 0;

    try {
      const d = disk.checkSync(rootPath);
      diskTotal = d.total / 1024 ** 3;
      diskUsed = (d.total - d.available) / 1024 ** 3;
      diskPct = parseFloat(((diskUsed / diskTotal) * 100).toFixed(2));
    } catch {
      this.logger.warn('Disk usage retrieval failed.');
    }

    // --- Network
    const netStats = await si.networkStats();
    const net0 = netStats[0] ?? { rx_bytes: 0, tx_bytes: 0 };
    const netRxKiB = (net0.rx_bytes ?? 0) / 1024;
    const netTxKiB = (net0.tx_bytes ?? 0) / 1024;

    // --- Disk I/O
    const diskIO = await si.disksIO();
    const readKiB = (diskIO.rIO ?? 0) / 1024;
    const writeKiB = (diskIO.wIO ?? 0) / 1024;

    await this.prisma.metric.create({
      data: {
        timestamp: new Date(),
        cpu_util_pct: cpuPct,
        mem_used_gib: usedMem,
        mem_total_gib: totalMem,
        mem_util_pct: memPct,
        disk_used_gib: diskUsed,
        disk_total_gib: diskTotal,
        disk_util_pct: diskPct,
        net_rx_kib: netRxKiB,
        net_tx_kib: netTxKiB,
        disk_read_kib: readKiB,
        disk_write_kib: writeKiB,
      },
    });

    // this.logger.log(
    //   `Metrics saved → CPU: ${cpuPct}% | MEM: ${memPct}% | DISK: ${diskPct}%`,
    // );
  }

  /**
   * Get latest snapshot
   */
  async getLatest() {
    return this.prisma.metric.findFirst({
      orderBy: { timestamp: 'desc' },
    });
  }

  /**
   * Fetch history between dates
   */
  async getHistory(from: Date, to: Date) {
    return this.prisma.metric.findMany({
      where: {
        timestamp: {
          gte: from,
          lte: to,
        },
      },
      orderBy: { timestamp: 'asc' },
    });
  }

  /**
   * Get rolling averages
   */
  async getAverages(days: number) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const result = await this.prisma.metric.aggregate({
      _avg: {
        cpu_util_pct: true,
        mem_util_pct: true,
        disk_util_pct: true,
        disk_read_kib: true,
        disk_write_kib: true,
        net_rx_kib: true,
        net_tx_kib: true,
      },
      where: { timestamp: { gte: since } },
    });

    return {
      days,
      avg_cpu_util_pct: result._avg.cpu_util_pct ?? 0,
      avg_mem_util_pct: result._avg.mem_util_pct ?? 0,
      avg_disk_util_pct: result._avg.disk_util_pct ?? 0,
      avg_disk_read_kib: result._avg.disk_read_kib ?? 0,
      avg_disk_write_kib: result._avg.disk_write_kib ?? 0,
      avg_net_rx_kib: result._avg.net_rx_kib ?? 0,
      avg_net_tx_kib: result._avg.net_tx_kib ?? 0,
    };
  }
}
