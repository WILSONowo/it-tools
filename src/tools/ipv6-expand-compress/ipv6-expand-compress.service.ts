import { parseIpv4 } from '@/utils/ipv4';

export interface ParsedIpv6 {
  /** The eight 16-bit groups */
  groups: number[];
  /** Zone id without the `%` (e.g. `eth0`), empty when absent */
  zone: string;
}

const HEX_GROUP = /^[0-9a-fA-F]{1,4}$/;

function parseHexGroups(parts: string[]): number[] | null {
  const groups: number[] = [];
  for (const part of parts) {
    if (!HEX_GROUP.test(part)) return null;
    groups.push(parseInt(part, 16));
  }
  return groups;
}

/**
 * Replace an embedded dotted IPv4 tail (`::ffff:192.0.2.1`) with the two equivalent hex groups (`::ffff:c000:201`).
 * Returns `null` when the IPv4 part is invalid.
 */
function replaceEmbeddedIpv4(address: string): string | null {
  if (!address.includes('.')) return address;

  const lastColon = address.lastIndexOf(':');
  if (lastColon === -1) return null;

  const v4 = parseIpv4(address.slice(lastColon + 1));
  if (v4 === null) return null;

  const high = Math.floor(v4 / 0x10000).toString(16);
  const low = (v4 % 0x10000).toString(16);
  return `${address.slice(0, lastColon + 1)}${high}:${low}`;
}

/**
 * Parse an IPv6 address in any textual form (full, `::`-compressed, embedded IPv4 tail, optional `%zone` suffix).
 * Returns `null` when the input is not a valid IPv6 address.
 */
export function parseIpv6(input: string): ParsedIpv6 | null {
  const value = input.trim();
  if (value === '') return null;

  const percent = value.indexOf('%');
  const zone = percent === -1 ? '' : value.slice(percent + 1);
  if (percent !== -1 && !/^[^\s%]+$/.test(zone)) return null;

  const address = replaceEmbeddedIpv4(percent === -1 ? value : value.slice(0, percent));
  if (address === null) return null;

  const doubleColon = address.indexOf('::');
  if (doubleColon === -1) {
    const parts = address.split(':');
    if (parts.length !== 8) return null;
    const groups = parseHexGroups(parts);
    return groups && { groups, zone };
  }

  if (address.indexOf('::', doubleColon + 1) !== -1) return null;

  const head = address.slice(0, doubleColon);
  const tail = address.slice(doubleColon + 2);
  const headGroups = parseHexGroups(head === '' ? [] : head.split(':'));
  const tailGroups = parseHexGroups(tail === '' ? [] : tail.split(':'));
  if (!headGroups || !tailGroups) return null;
  // `::` stands for at least one zero group
  if (headGroups.length + tailGroups.length > 7) return null;

  const zeros = new Array(8 - headGroups.length - tailGroups.length).fill(0);
  return { groups: [...headGroups, ...zeros, ...tailGroups], zone };
}

function withZone(address: string, zone: string): string {
  return zone === '' ? address : `${address}%${zone}`;
}

/** Full form: eight zero-padded groups. */
export function expandIpv6({ groups, zone }: ParsedIpv6): string {
  return withZone(groups.map((g) => g.toString(16).padStart(4, '0')).join(':'), zone);
}

/** Canonical RFC 5952 form: lowercase, no leading zeros, the first longest run (≥ 2) of zero groups replaced by `::`. */
export function compressIpv6({ groups, zone }: ParsedIpv6): string {
  let longestStart = -1;
  let longestLen = 0;
  let curStart = -1;
  let curLen = 0;
  for (let i = 0; i < 8; i++) {
    if (groups[i] === 0) {
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

  const hex = (part: number[]) => part.map((g) => g.toString(16)).join(':');

  if (longestLen >= 2) {
    const head = hex(groups.slice(0, longestStart));
    const tail = hex(groups.slice(longestStart + longestLen));
    return withZone(`${head}::${tail}`, zone);
  }

  return withZone(hex(groups), zone);
}
