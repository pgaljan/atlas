import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function parseArgs() {
  const argv = process.argv.slice(2);
  const out: any = {};
  for (const a of argv) {
    const [k, v] = a.split('=');
    const key = k.replace(/^--/, '');
    out[key] = v ?? true;
  }
  return out;
}

async function main() {
  const args = parseArgs();
  const retainDays = parseInt(args['retain-days'] ?? '90', 10);
  const dryRun =
    args.dryRun === 'true' ||
    args['dry-run'] === 'true' ||
    args.dryRun === true;
  const batchSize = parseInt(args.batchSize ?? args['batch-size'] ?? '0', 10);

  if (Number.isNaN(retainDays) || retainDays <= 0) {
    throw new Error('Invalid retain-days');
  }

  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - retainDays);

  console.log(
    `Retention: ${retainDays} days — cutoff = ${cutoff.toISOString()}. dryRun=${dryRun} batchSize=${batchSize || 'none'}`,
  );

  if (batchSize && batchSize > 0) {
    let totalDeleted = 0;
    while (true) {
      const batch = await prisma.auditLog.findMany({
        where: { createdAt: { lt: cutoff } },
        take: batchSize,
        select: { id: true },
        orderBy: { createdAt: 'asc' },
      });
      if (batch.length === 0) break;
      const ids = batch.map((b) => b.id);
      if (dryRun) {
        console.log(
          `Would delete batch of ${ids.length} rows (examples ids):`,
          ids.slice(0, 5),
        );
        totalDeleted += ids.length;
      } else {
        const res = await prisma.auditLog.deleteMany({
          where: { id: { in: ids } },
        });
        console.log(`Deleted ${res.count} rows in batch`);
        totalDeleted += res.count;
      }
      if (batch.length < batchSize) break;
    }
    console.log(
      dryRun
        ? `Dry-run total rows that would be deleted: ${totalDeleted}`
        : `Total deleted rows: ${totalDeleted}`,
    );
  } else {
    const count = await prisma.auditLog.count({
      where: { createdAt: { lt: cutoff } },
    });
    if (count === 0) {
      console.log('No rows to delete.');
    } else {
      console.log(`Rows older than cutoff: ${count}`);
      if (dryRun) {
        console.log('Dry-run true — not deleting.');
      } else {
        const res = await prisma.auditLog.deleteMany({
          where: { createdAt: { lt: cutoff } },
        });
        console.log(`Deleted ${res.count} audit log rows.`);
      }
    }
  }

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('Failed:', err);
  await prisma.$disconnect();
  process.exit(1);
});
