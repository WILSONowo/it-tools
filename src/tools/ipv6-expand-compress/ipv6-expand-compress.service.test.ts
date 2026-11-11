import { describe, expect, it } from 'vitest';
import { compressIpv6, expandIpv6, parseIpv6 } from './ipv6-expand-compress.service';

function roundTrip(address: string) {
  const parsed = parseIpv6(address);
  if (!parsed) throw new Error(`could not parse ${address}`);
  return { expanded: expandIpv6(parsed), compressed: compressIpv6(parsed) };
}

describe('ipv6-expand-compress', () => {
  it('expands and compresses plain addresses', () => {
    expect(roundTrip('2001:db8::1')).toEqual({
      expanded: '2001:0db8:0000:0000:0000:0000:0000:0001',
      compressed: '2001:db8::1',
    });
    expect(roundTrip('::').compressed).toBe('::');
    expect(roundTrip('::1').expanded).toBe('0000:0000:0000:0000:0000:0000:0000:0001');
    expect(roundTrip('1::').compressed).toBe('1::');
    expect(roundTrip('2001:0DB8:0000:0000:0001:0000:0000:0001').compressed).toBe('2001:db8::1:0:0:1');
  });

  it('follows RFC 5952 compression rules', () => {
    // a single zero group is not compressed
    expect(roundTrip('2001:db8:0:1:1:1:1:1').compressed).toBe('2001:db8:0:1:1:1:1:1');
    // the longest run wins, the first one on ties
    expect(roundTrip('2001:0:0:1:0:0:0:1').compressed).toBe('2001:0:0:1::1');
    expect(roundTrip('2001:db8:0:0:1:0:0:1').compressed).toBe('2001:db8::1:0:0:1');
  });

  it('accepts an embedded IPv4 tail', () => {
    expect(roundTrip('::ffff:192.0.2.1')).toEqual({
      expanded: '0000:0000:0000:0000:0000:ffff:c000:0201',
      compressed: '::ffff:c000:201',
    });
    expect(roundTrip('64:ff9b::1.2.3.4').compressed).toBe('64:ff9b::102:304');
    expect(roundTrip('::1.2.3.4').compressed).toBe('::102:304');
    expect(roundTrip('0:0:0:0:0:ffff:10.0.0.1').compressed).toBe('::ffff:a00:1');
  });

  it('preserves a zone id', () => {
    expect(roundTrip('fe80::1%eth0')).toEqual({
      expanded: 'fe80:0000:0000:0000:0000:0000:0000:0001%eth0',
      compressed: 'fe80::1%eth0',
    });
    expect(parseIpv6('fe80::1%')).toBeNull();
  });

  it('rejects invalid addresses', () => {
    for (const address of [
      '',
      '1.2.3.4',
      '1::2::3',
      '1:2:3:4:5:6:7:8:9',
      '1:2:3:4:5:6:7',
      '1:2:3:4:5:6:7:8::',
      '12345::',
      'g::1',
      ':1:2:3:4:5:6:7',
      '::ffff:256.0.0.1',
      '::1.2.3',
      '1.2.3.4::',
      '::1.2.3.4:5',
    ]) {
      expect(parseIpv6(address), address).toBeNull();
    }
  });
});
