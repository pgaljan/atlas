import { PrismaClient } from '@prisma/client';
import { stringify } from 'csv-stringify/sync';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

type Args = {
  from?: string;
  to?: string;
  format?: string;
  out?: string;
  userId?: string;
  action?: string;
};

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  const out: any = {};
  for (const a of argv) {
    const [k, v] = a.split('=');
    const key = k.replace(/^--/, '');
    out[key] = v ?? true;
  }
  return out;
}

function toDateOrUndefined(s?: string) {
  if (!s) return undefined;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid date: ${s}`);
  }
  return d;
}

async function main() {
  const args = parseArgs();
  const from = toDateOrUndefined(args.from);
  const to = toDateOrUndefined(args.to);
  const format = (args.format || 'csv').toLowerCase();
  const outPath =
    args.out ||
    (format === 'csv'
      ? `./audit-logs-${Date.now()}.csv`
      : `./audit-logs-${Date.now()}.json`);
  const userId = args.userId;
  const action = args.action;

  const where: any = {};
  if (from || to) where.createdAt = {};
  if (from) where.createdAt.gte = from;
  if (to) where.createdAt.lte = to;
  if (userId) where.userId = userId;
  if (action) where.action = action;

  console.log('Querying audit logs with filter:', JSON.stringify(where));

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: 'asc' },
    include: { user: { select: { id: true, username: true, email: true } } },
  });

  if (!logs.length) {
    console.log('No audit logs found for the given filter.');
    await prisma.$disconnect();
    return;
  }

  function formatDetails(details: any, format: 'csv' | 'json') {
    if (!details) return format === 'json' ? {} : '';

    if (format === 'json') {
      return typeof details === 'string' ? JSON.parse(details) : details;
    }

    try {
      return JSON.stringify(
        typeof details === 'string' ? JSON.parse(details) : details,
      );
    } catch {
      return typeof details === 'string' ? details : JSON.stringify(details);
    }
  }
  const rows = logs.map((r) => ({
    id: r.id,
    action: r.action,
    element: r.element ?? '',
    elementId: r.elementId ?? '',
    createdAt: r.createdAt.toISOString(),
    userId: r.userId ?? '',
    username: r.user?.username ?? '',
    email: r.user?.email ?? '',
    details: formatDetails(r.details, format as 'csv' | 'json'),
  }));

  const outDir = path.dirname(outPath);
  if (outDir && outDir !== '.' && !fs.existsSync(outDir))
    fs.mkdirSync(outDir, { recursive: true });

  if (format === 'json') {
    fs.writeFileSync(outPath, JSON.stringify(rows, null, 2), 'utf8');
    console.log(`Wrote ${rows.length} audit log rows to ${outPath}`);
  } else if (format === 'csv') {
    const header = Object.keys(rows[0]);
    const csv = stringify(rows, { header: true, columns: header });
    fs.writeFileSync(outPath, csv, 'utf8');
    console.log(`Wrote ${rows.length} audit log rows to ${outPath}`);
  } else {
    throw new Error(`Unsupported format: ${format}`);
  }

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('Failed:', err);
  await prisma.$disconnect();
  process.exit(1);
});
