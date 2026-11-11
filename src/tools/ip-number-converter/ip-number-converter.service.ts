const B8 = BigInt(8);
const B16 = BigInt(16);
const B255 = BigInt(255);
const B65535 = BigInt(65535);

export function isValidIp(value: string): boolean {
  return parseIpToBigInt(value) !== null;
}

export function parseIpv4ToBigInt(value: string): bigint | null {
  const parts = value.trim().split('.');
  if (parts.length !== 4) return null;
  let result = BigInt(0);
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null;
    const num = Number(part);
    if (num > 255) return null;
    result = (result << B8) | BigInt(num);
  }
  return result;
}

export function parseIpv6ToBigInt(value: string): bigint | null {
  const clean = value.trim();
  if (clean === '') return null;
  if (clean.includes('.')) {
    // IPv6 with embedded IPv4 in the last 32 bits, e.g. ::ffff:192.168.1.1 -> ::ffff:c0a8:101
    const v4Index = clean.lastIndexOf(':');
    if (v4Index === -1) return null;
    const head = clean.slice(0, v4Index + 1);
    const v4 = parseIpv4ToBigInt(clean.slice(v4Index + 1));
    if (v4 === null) return null;
    const hi = ((v4 >> B16) & B65535).toString(16);
    const lo = (v4 & B65535).toString(16);
    return parseIpv6ToBigInt(`${head}${hi}:${lo}`);
  }

  const doubleColon = clean.indexOf('::');
  if (doubleColon === -1) {
    const parts = clean.split(':');
    if (parts.length !== 8) return null;
    let result = BigInt(0);
    for (const part of parts) {
      if (!/^[0-9a-fA-F]{1,4}$/.test(part)) return null;
      result = (result << B16) | BigInt(parseInt(part, 16));
    }
    return result;
  }

  const head = clean.slice(0, doubleColon);
  const tail = clean.slice(doubleColon + 2);
  const headParts = head === '' ? [] : head.split(':');
  const tailParts = tail === '' ? [] : tail.split(':');
  if (headParts.length + tailParts.length >= 8) return null;

  let result = BigInt(0);
  for (const part of headParts) {
    if (!/^[0-9a-fA-F]{1,4}$/.test(part)) return null;
    result = (result << B16) | BigInt(parseInt(part, 16));
  }
  const missing = 8 - headParts.length - tailParts.length;
  result <<= B16 * BigInt(missing);
  for (const part of tailParts) {
    if (!/^[0-9a-fA-F]{1,4}$/.test(part)) return null;
    result = (result << B16) | BigInt(parseInt(part, 16));
  }
  return result;
}

export function parseIpToBigInt(value: string): bigint | null {
  const clean = value.trim();
  if (clean.includes(':')) return parseIpv6ToBigInt(clean);
  return parseIpv4ToBigInt(clean);
}

/**
 * Parse a non-negative integer (decimal, or hexadecimal with a 0x prefix) without throwing.
 * Returns null for anything else (e.g. "abc", "1.5", "-1", "").
 */
export function parseNonNegativeBigInt(value: string): bigint | null {
  const clean = value.trim();
  if (/^\d+$/.test(clean)) return BigInt(clean);
  if (/^0x[0-9a-f]+$/i.test(clean)) return BigInt(clean);
  return null;
}

export function bigIntToIpv4(value: bigint): string {
  const parts: string[] = [];
  let v = value;
  for (let i = 0; i < 4; i++) {
    parts.unshift(String(v & B255));
    v >>= B8;
  }
  return parts.join('.');
}

export function bigIntToIpv6(value: bigint): string {
  const groups: string[] = [];
  let v = value;
  for (let i = 0; i < 8; i++) {
    groups.unshift((v & B65535).toString(16));
    v >>= B16;
  }
  // compress :: (longest run of zero groups)
  let longestStart = -1;
  let longestLen = 0;
  let curStart = -1;
  let curLen = 0;
  for (let i = 0; i < 8; i++) {
    if (groups[i] === '0') {
      if (curStart === -1) curStart = i;
      curLen++;
      if (curLen > longestLen) {
        longestLen = curLen;
        longestStart = curStart;
      }
    } else {
      curStart = -1;
      curLen = 0;
    }
  }
  if (longestLen >= 2) {
    const head = groups.slice(0, longestStart).join(':');
    const tail = groups.slice(longestStart + longestLen).join(':');
    return `${head}::${tail}`;
  }
  return groups.join(':');
}
