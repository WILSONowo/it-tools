import { describe, expect, it } from 'vitest';
import {
  bigIntToIpv4,
  bigIntToIpv6,
  parseIpToBigInt,
  parseIpv6ToBigInt,
  parseNonNegativeBigInt,
} from './ip-number-converter.service';

describe('ip-number-converter', () => {
  it('converts IPv4 addresses', () => {
    expect(parseIpToBigInt('192.168.1.1')).toBe(BigInt(3232235777));
    expect(parseIpToBigInt('256.0.0.1')).toBeNull();
    expect(bigIntToIpv4(BigInt(3232235777))).toBe('192.168.1.1');
  });

  it('converts IPv6 addresses', () => {
    expect(parseIpToBigInt('::1')).toBe(BigInt(1));
    expect(parseIpToBigInt('2001:db8::1')).toBe(BigInt('0x20010db8000000000000000000000001'));
    expect(bigIntToIpv6(BigInt('0x20010db8000000000000000000000001'))).toBe('2001:db8::1');
    expect(parseIpToBigInt('1:2:3:4:5:6:7:8:9')).toBeNull();
  });

  it('handles IPv4-mapped IPv6 addresses', () => {
    expect(parseIpToBigInt('::ffff:1.2.3.4')).toBe(BigInt('0xffff01020304'));
    expect(parseIpToBigInt('::ffff:192.168.1.1')).toBe(BigInt('0xffffc0a80101'));
    expect(parseIpv6ToBigInt('64:ff9b::1.2.3.4')).toBe(BigInt('0x0064ff9b000000000000000001020304'));
    expect(parseIpToBigInt('::ffff:1.2.3.256')).toBeNull();
  });

  it('parses number input without throwing', () => {
    expect(parseNonNegativeBigInt('3232235777')).toBe(BigInt(3232235777));
    expect(parseNonNegativeBigInt('0xff')).toBe(BigInt(255));
    expect(parseNonNegativeBigInt('abc')).toBeNull();
    expect(parseNonNegativeBigInt('1.5')).toBeNull();
    expect(parseNonNegativeBigInt('-1')).toBeNull();
    expect(parseNonNegativeBigInt('')).toBeNull();
  });
});
