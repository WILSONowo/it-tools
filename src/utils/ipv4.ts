/**
 * Shared IPv4 helpers. Addresses are handled as unsigned 32-bit integers (0 … 2^32 - 1).
 */

export const IPV4_MAX = 0xffffffff;

/**
 * Parse a dotted-quad IPv4 address into an unsigned 32-bit integer.
 * Exactly four decimal octets (0-255) are required; surrounding whitespace is ignored.
 * Octets with leading zeros (`010`) are rejected unless `allowLeadingZeros` is set,
 * because some parsers read them as octal.
 * Returns `null` when the input is not a valid address.
 */
export function parseIpv4(
  input: string,
  { allowLeadingZeros = false }: { allowLeadingZeros?: boolean } = {},
): number | null {
  const parts = input.trim().split('.');
  if (parts.length !== 4) return null;

  let result = 0;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null;
    if (!allowLeadingZeros && part.length > 1 && part.startsWith('0')) return null;
    const octet = Number(part);
    if (octet > 255) return null;
    result = result * 256 + octet;
  }

  return result;
}

export function isValidIpv4(input: string): boolean {
  return parseIpv4(input) !== null;
}

/** Format an unsigned 32-bit integer as a dotted-quad IPv4 address. */
export function formatIpv4(value: number): string {
  const n = value >>> 0;
  return `${n >>> 24}.${(n >>> 16) & 0xff}.${(n >>> 8) & 0xff}.${n & 0xff}`;
}

/** Convert a prefix length (0-32) to a netmask integer, e.g. 24 → 0xffffff00. */
export function prefixToMask(prefix: number): number {
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) {
    throw new RangeError(`Invalid IPv4 prefix length: ${prefix}`);
  }
  return prefix === 0 ? 0 : (IPV4_MAX << (32 - prefix)) >>> 0;
}

/** Convert a netmask integer to a prefix length, or `null` if the mask bits are not contiguous. */
export function maskToPrefix(mask: number): number | null {
  const m = mask >>> 0;
  const inverted = ~m >>> 0;
  // A valid mask is ones followed by zeros, so its inverse + 1 is a power of two.
  if ((inverted & (inverted + 1)) !== 0) return null;
  let prefix = 0;
  for (let bit = 31; bit >= 0 && (m >>> bit) & 1; bit--) prefix++;
  return prefix;
}

/** Number of addresses in a block of the given prefix length, e.g. 24 → 256. */
export function blockSize(prefix: number): number {
  return 2 ** (32 - prefix);
}
