import { describe, expect, it } from 'vitest';
import { blockSize, formatIpv4, isValidIpv4, maskToPrefix, parseIpv4, prefixToMask } from './ipv4';

describe('ipv4 utils', () => {
  describe('parseIpv4', () => {
    it('parses dotted-quad addresses to unsigned integers', () => {
      expect(parseIpv4('0.0.0.0')).toBe(0);
      expect(parseIpv4('192.168.0.1')).toBe(3232235521);
      expect(parseIpv4(' 10.0.0.1 ')).toBe(167772161);
      expect(parseIpv4('255.255.255.255')).toBe(4294967295);
    });

    it('rejects malformed addresses', () => {
      for (const ip of [
        '',
        ' ',
        'foo',
        '1.2.3',
        '1.2.3.4.5',
        '1.2.3.',
        '.1.2.3',
        '256.0.0.1',
        '1.2.3.a',
        '1.2.3.-1',
        '1..2.3',
        '1.2.3.1000',
        '1.2.3.4/24',
        '+1.2.3.4',
      ]) {
        expect(parseIpv4(ip), ip).toBeNull();
      }
    });

    it('rejects leading zeros unless allowed', () => {
      expect(parseIpv4('010.0.0.1')).toBeNull();
      expect(parseIpv4('010.0.0.1', { allowLeadingZeros: true })).toBe(167772161);
      expect(parseIpv4('0.0.0.0')).toBe(0);
    });

    it('isValidIpv4 mirrors parseIpv4', () => {
      expect(isValidIpv4('1.2.3.4')).toBe(true);
      expect(isValidIpv4('1.2.3.256')).toBe(false);
    });
  });

  it('formats unsigned integers as dotted quads', () => {
    expect(formatIpv4(0)).toBe('0.0.0.0');
    expect(formatIpv4(3232235521)).toBe('192.168.0.1');
    expect(formatIpv4(4294967295)).toBe('255.255.255.255');
    expect(formatIpv4(-1)).toBe('255.255.255.255');
  });

  it('converts between prefixes and masks', () => {
    expect(prefixToMask(0)).toBe(0);
    expect(prefixToMask(1)).toBe(0x80000000);
    expect(prefixToMask(24)).toBe(0xffffff00);
    expect(prefixToMask(32)).toBe(0xffffffff);
    expect(() => prefixToMask(33)).toThrow();

    for (let prefix = 0; prefix <= 32; prefix++) {
      expect(maskToPrefix(prefixToMask(prefix))).toBe(prefix);
    }
    expect(maskToPrefix(0xff00ff00)).toBeNull();
  });

  it('computes block sizes', () => {
    expect(blockSize(32)).toBe(1);
    expect(blockSize(24)).toBe(256);
    expect(blockSize(0)).toBe(2 ** 32);
  });
});
