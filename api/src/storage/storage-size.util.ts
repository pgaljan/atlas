import * as fs from 'fs';
import * as path from 'path';


export function normalizeToBytesNumber(value: any): number {
  if (value === undefined || value === null) return 0;
  if (typeof value === 'bigint') {
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || Number.isNaN(value) || value < 0) return 0;
    return value;
  }
  if (typeof value === 'string') {
    const s = value.trim();
    if (!s) return 0;
    if (/^\d+$/.test(s)) {
      const n = Number(s);
      if (!Number.isNaN(n)) return n;
    }
    const parsed = parseBytesFromString(s);
    if (parsed > 0) return parsed;
    const nf = Number(s);
    if (!Number.isNaN(nf) && isFinite(nf) && nf > 0) return nf;
    return 0;
  }
  if (typeof value === 'object') {
    try {
      if (typeof (value as any).toNumber === 'function') {
        const num = (value as any).toNumber();
        if (Number.isFinite(num) && !Number.isNaN(num) && num >= 0) return num;
      }
      if (typeof (value as any).toString === 'function') {
        const s = (value as any).toString();
        const parsed = parseBytesFromString(s);
        if (parsed > 0) return parsed;
        const n = Number(s);
        if (!Number.isNaN(n) && isFinite(n) && n >= 0) return n;
      }
    } catch (e) {
      // ignore
    }
  }
  return 0;
}

export function parseBytesFromString(s: string): number {
  if (!s || typeof s !== 'string') return 0;
  const trimmed = s.trim().replace(/[,]/g, '');
  if (/^\d+$/.test(trimmed)) {
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : 0;
  }
  const m = trimmed.match(/^([\d.]+)\s*(b|bytes|kb|kib|mb|mib|gb|gib|tb|tib)?$/i);
  if (!m) return 0;
  const num = Number(m[1]);
  if (!Number.isFinite(num)) return 0;
  const unit = (m[2] || '').toLowerCase();
  switch (unit) {
    case '':
    case 'b':
    case 'bytes':
      return num;
    case 'kb':
      return num * 1000;
    case 'kib':
      return num * 1024;
    case 'mb':
      return num * 1_000_000;
    case 'mib':
      return num * 1024 * 1024;
    case 'gb':
      return num * 1_000_000_000;
    case 'gib':
      return num * 1024 * 1024 * 1024;
    case 'tb':
      return num * 1_000_000_000_000;
    case 'tib':
      return num * 1024 * 1024 * 1024 * 1024;
    default:
      return num;
  }
}


export function parseAttachmentSizeBytes(att: any): number {
  if (!att) return 0;
  const fields = [
    att.size,
    att?.meta?.size,
    att?.sizeInBytes,
    att?.file?.size,
    att?.bytes,
    att?.length,
  ];
  for (const f of fields) {
    const num = normalizeToBytesNumber(f);
    if (num > 0) return num;
  }
  if (typeof att === 'string') {
    const parsed = parseBytesFromString(att);
    if (parsed > 0) return parsed;
  }
  try {
    const text = JSON.stringify(att);
    const m = text.match(/([\d,.]+)\s*(kib|kb|mib|mb|gib|gb|tib|tb)\b/i);
    if (m) {
      const parsed = parseBytesFromString(m[0]);
      if (parsed > 0) return parsed;
    }
  } catch (e) {
    // ignore
  }
  return 0;
}

export function getAttachmentBytesBigInt(a: any): bigint {
  if (!a) return 0n;
  const candidates = [
    a.sizeBytes,
    a?.sizeBytes,
    a?.data?.sizeBytes,
    a?.data?.size,
    a?.data?.meta?.size,
    a?.data?.sizeInBytes,
    a?.data?.file?.size,
    a?.bytes,
    a?.data?.bytes,
    a?.length,
    a.size,
  ];
  for (const c of candidates) {
    const n = normalizeToBytesNumber(c);
    if (n > 0) return BigInt(Math.floor(n));
  }
  const parsedFromData = parseAttachmentSizeBytes(a?.data ?? a);
  if (parsedFromData > 0) return BigInt(Math.floor(parsedFromData));
  return 0n;
}

export function getBackupBytesBigInt(b: any): bigint {
  if (!b) return 0n;
  const data = b.backupData ?? {};
  const candidates = [data.sizeBytes, data.size, data.sizeInBytes, b.sizeBytes];
  for (const c of candidates) {
    const n = normalizeToBytesNumber(c);
    if (n > 0) return BigInt(Math.floor(n));
  }
  try {
    const fileUrl = b.fileUrl;
    if (fileUrl && typeof fileUrl === 'string') {
      const filename = fileUrl.split('/').pop();
      if (filename) {
        const localPath = path.join(process.cwd(), 'public', 'backups', filename);
        if (fs.existsSync(localPath)) {
          const stats = fs.statSync(localPath);
          if (stats && typeof stats.size === 'number' && stats.size > 0) {
            return BigInt(stats.size);
          }
        }
      }
    }
  } catch (err) {
    // ignore
  }
  const parsed = parseAttachmentSizeBytes(b.backupData ?? b);
  if (parsed > 0) return BigInt(Math.floor(parsed));
  return 0n;
}

export function bigIntBytesToMiBNumber(bytesBigInt: bigint, precision = 2): number {
  if (!bytesBigInt || bytesBigInt <= 0n) return 0;
  const BYTES_PER_MIB = 1024n * 1024n;
  const scale = BigInt(10 ** precision);
  const scaled = (bytesBigInt * scale) / BYTES_PER_MIB;
  const asNumber = Number(scaled) / Math.pow(10, precision);
  const factor = Math.pow(10, precision);
  return Math.round(asNumber * factor) / factor;
}
