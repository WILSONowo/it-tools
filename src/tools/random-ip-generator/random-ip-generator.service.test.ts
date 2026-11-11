import { describe, expect, it } from 'vitest';
import { isValidIpv4 } from '@/utils/ipv4';
import { randomIpv4, randomIpv6, randomMac } from './random-ip-generator.service';

describe('random-ip-generator', () => {
  it('generates valid IPv4 host addresses', () => {
    for (let i = 0; i < 50; i++) {
      const ip = randomIpv4();
      expect(isValidIpv4(ip)).toBe(true);
      const octets = ip.split('.').map(Number);
      expect(octets[0]).toBeGreaterThanOrEqual(1);
      expect(octets[3]).toBeLessThanOrEqual(254);
    }
  });

  it('generates IPv6 addresses with 8 groups', () => {
    expect(randomIpv6()).toMatch(/^([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$/);
  });

  it('formats MAC addresses', () => {
    expect(randomMac({ format: 'aa:bb:cc:dd:ee:ff', uppercase: false })).toMatch(/^([0-9a-f]{2}:){5}[0-9a-f]{2}$/);
    expect(randomMac({ format: 'aabb.ccdd.eeff', uppercase: true })).toMatch(/^[0-9A-F]{4}\.[0-9A-F]{4}\.[0-9A-F]{4}$/);
  });
});
