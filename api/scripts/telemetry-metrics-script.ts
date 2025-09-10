// File: exportMetrics.ts
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { parseISO, startOfDay, endOfDay } from 'date-fns';

const prisma = new PrismaClient();

async function exportMetrics() {
  const latestArg = process.argv.includes('--current');
  if (latestArg) {
    const latest = await prisma.metric.findFirst({
      orderBy: { timestamp: 'desc' },
    });
    console.log(
      latest ? 'Current Telemetry Snapshot:' : 'No telemetry data found.',
      latest ?? '',
    );
    await prisma.$disconnect();
    return;
  }

  // CLI arguments
  const fromArg = process.argv.find((arg) => arg.startsWith('--from='));
  const toArg = process.argv.find((arg) => arg.startsWith('--to='));
  const formatArg = process.argv.find((arg) => arg.startsWith('--format='));
  const format = formatArg ? formatArg.split('=')[1].toLowerCase() : 'both';

  const today = new Date();
  const from = fromArg ? parseISO(fromArg.split('=')[1]) : startOfDay(today);
  const to = toArg ? parseISO(toArg.split('=')[1]) : endOfDay(today);

  console.log(
    'Querying metrics from',
    from.toISOString(),
    'to',
    to.toISOString(),
  );

  // Fetch metrics
  const metrics = await prisma.metric.findMany({
    where: { timestamp: { gte: from, lte: to } },
    orderBy: { timestamp: 'asc' },
  });

  // Map metrics to human-readable keys
  const readableMetrics = metrics.map((m) => ({
    Timestamp: m.timestamp.toISOString(),
    'CPU Average (% utilization)': m.cpu_util_pct ?? 0,
    'Memory Space (GiB total)': m.mem_total_gib ?? 0,
    'Memory Space (% used)':
      m.mem_util_pct ??
      (((m.mem_used_gib ?? 0) / (m.mem_total_gib ?? 1)) * 100).toFixed(2),
    'Disk Space (GiB total)': m.disk_total_gib ?? 0,
    'Disk Space (% used)':
      m.disk_util_pct ??
      (((m.disk_used_gib ?? 0) / (m.disk_total_gib ?? 1)) * 100).toFixed(2),
    'Disk I/O (KiB) Read': m.disk_read_kib ?? 0,
    'Disk I/O (KiB) Write': m.disk_write_kib ?? 0,
    'Network I/O (KiB) Received': m.net_rx_kib ?? 0,
    'Network I/O (KiB) Sent': m.net_tx_kib ?? 0,
  }));

  // Export folder
  const exportDir = path.join(process.cwd(), 'export-telemetry-metrics');
  if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir, { recursive: true });

  const safeFrom = from.toISOString().replace(/[:.]/g, '-');
  const safeTo = to.toISOString().replace(/[:.]/g, '-');

  const jsonPath = path.join(exportDir, `metrics_${safeFrom}_${safeTo}.json`);
  const csvPath = path.join(exportDir, `metrics_${safeFrom}_${safeTo}.csv`);

  // JSON Export
  if (format === 'json' || format === 'both') {
    fs.writeFileSync(jsonPath, JSON.stringify(readableMetrics, null, 2));
    console.log(`- JSON exported to: ${jsonPath}`);
  }

  // CSV Export
  if ((format === 'csv' || format === 'both') && readableMetrics.length > 0) {
    const headers = Object.keys(readableMetrics[0]).join(',');
    const rows = readableMetrics
      .map((m) =>
        Object.values(m)
          .map((v) => (v instanceof Date ? v.toISOString() : v))
          .join(','),
      )
      .join('\n');
    fs.writeFileSync(csvPath, `${headers}\n${rows}`);
    console.log(`- CSV exported to: ${csvPath}`);
  } else if (format === 'csv' || format === 'both') {
    fs.writeFileSync(csvPath, '');
    console.log(`- CSV exported to: ${csvPath} (empty)`);
  }

  console.log(`Exported ${readableMetrics.length} records.`);
  await prisma.$disconnect();
}

exportMetrics().catch((e) => {
  console.error(e);
  process.exit(1);
});
