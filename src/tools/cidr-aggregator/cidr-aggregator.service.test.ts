import { describe, expect, it } from 'vitest';
import { aggregateIpv4 } from './cidr-aggregator.service';

describe('IPv4 CIDR aggregation', () => {
  it('merges adjacent blocks and ignores duplicate addresses', () => {
    expect(aggregateIpv4(['192.0.2.128/25', '192.0.2.2', '192.0.2.0/25'])).toEqual(['192.0.2.0/24']);
  });

  it('handles both halves of the IPv4 space and its last address', () => {
    expect(aggregateIpv4(['0.0.0.0/0'])).toEqual(['0.0.0.0/0']);
    expect(aggregateIpv4(['128.0.0.0/1'])).toEqual(['128.0.0.0/1']);
    expect(aggregateIpv4(['255.255.255.255'])).toEqual(['255.255.255.255/32']);
  });

  it('rejects malformed prefixes', () => {
    expect(() => aggregateIpv4(['192.0.2.1/24/32'])).toThrow();
  });
});
