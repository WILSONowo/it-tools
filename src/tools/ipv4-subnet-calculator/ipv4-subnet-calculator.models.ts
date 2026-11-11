import { IPV4_MAX } from '@/utils/ipv4';

export { getAdjacentBlockBase, getIPClass };

function getIPClass({ ip }: { ip: string }) {
  const [firstOctet] = ip.split('.').map(Number);

  if (firstOctet < 128) {
    return 'A';
  }
  if (firstOctet > 127 && firstOctet < 192) {
    return 'B';
  }
  if (firstOctet > 191 && firstOctet < 224) {
    return 'C';
  }
  if (firstOctet > 223 && firstOctet < 240) {
    return 'D';
  }
  if (firstOctet > 239 && firstOctet < 256) {
    return 'E';
  }

  return undefined;
}

/**
 * Base address of the block `count` blocks away from the one starting at `base`,
 * or `null` when that block would fall outside the IPv4 address space (no wrap-around).
 */
function getAdjacentBlockBase({ base, size, count }: { base: number; size: number; count: number }): number | null {
  const target = base + size * count;
  if (target < 0 || target + size - 1 > IPV4_MAX) {
    return null;
  }

  return target;
}
