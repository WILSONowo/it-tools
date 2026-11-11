import { randIntFromInterval } from '@/utils/random';

export type MacFormat = 'aa:bb:cc:dd:ee:ff' | 'aabb.ccdd.eeff';

/** Random IPv4 host address, avoiding .0/.255 in the first and last octet. */
export function randomIpv4(): string {
  return [
    randIntFromInterval(1, 254),
    randIntFromInterval(0, 255),
    randIntFromInterval(0, 255),
    randIntFromInterval(1, 254),
  ].join('.');
}

export function randomIpv6(): string {
  return Array.from({ length: 8 }, () => randIntFromInterval(0, 0xffff).toString(16)).join(':');
}

export function randomMac({ format, uppercase }: { format: MacFormat; uppercase: boolean }): string {
  const bytes = Array.from({ length: 6 }, () => {
    const byte = randIntFromInterval(0, 255).toString(16).padStart(2, '0');
    return uppercase ? byte.toUpperCase() : byte;
  });

  if (format === 'aa:bb:cc:dd:ee:ff') {
    return bytes.join(':');
  }

  return `${bytes.slice(0, 2).join('')}.${bytes.slice(2, 4).join('')}.${bytes.slice(4, 6).join('')}`;
}
