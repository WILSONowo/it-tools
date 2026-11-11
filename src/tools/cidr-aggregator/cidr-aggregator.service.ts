import { blockSize, formatIpv4, IPV4_MAX, parseIpv4, prefixToMask } from '@/utils/ipv4';

function ipv4ToNumber(ip: string): number {
  const value = parseIpv4(ip, { allowLeadingZeros: true });
  if (value === null) throw new Error(`无效的 IPv4: ${ip}`);
  return value;
}

function log2(value: number): number {
  return Math.round(Math.log(value) / Math.LN2);
}

function largestAlignedBlock(start: number, end: number): number {
  let size = start === 0 ? 2 ** 32 : (start & -start) >>> 0;
  while (start + size - 1 > end) size /= 2;
  return size;
}

export function parseCidr(entry: string): { start: number; prefix: number } {
  const trimmed = entry.trim();
  const hasPrefix = trimmed.includes('/');
  if (hasPrefix) {
    const [ip, prefixRaw, extra] = trimmed.split('/');
    if (extra !== undefined) throw new Error(`无效的 CIDR: ${entry}`);
    const prefix = Number(prefixRaw);
    if (!/^\d{1,2}$/.test(prefixRaw) || prefix < 0 || prefix > 32) throw new Error(`无效的 CIDR: ${entry}`);
    const start = ipv4ToNumber(ip);
    return { start: (start & prefixToMask(prefix)) >>> 0, prefix };
  }
  return { start: ipv4ToNumber(trimmed), prefix: 32 };
}

function networkEnd(start: number, prefix: number): number {
  if (prefix === 0) return IPV4_MAX;
  return (start + blockSize(prefix) - 1) >>> 0;
}

export function aggregateIpv4(entries: string[]): string[] {
  const networks = entries.map(parseCidr).map(({ start, prefix }) => ({ start, end: networkEnd(start, prefix) }));
  networks.sort((a, b) => a.start - b.start || a.end - b.end);

  const merged: { start: number; end: number }[] = [];
  for (const net of networks) {
    const last = merged[merged.length - 1];
    if (last && net.start <= last.end + 1) {
      last.end = Math.max(last.end, net.end);
    } else {
      merged.push({ start: net.start, end: net.end });
    }
  }

  const result: string[] = [];
  for (const range of merged) {
    let current = range.start >>> 0;
    while (current <= range.end) {
      const size = largestAlignedBlock(current, range.end);
      const prefix = 32 - log2(size);
      result.push(`${formatIpv4(current)}/${prefix}`);
      current += size;
    }
  }

  return result;
}
