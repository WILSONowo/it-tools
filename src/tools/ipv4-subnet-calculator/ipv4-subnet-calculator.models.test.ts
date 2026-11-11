import { describe, expect, it } from 'vitest';
import { getAdjacentBlockBase, getIPClass } from './ipv4-subnet-calculator.models';

describe('ipv4-subnet-calculator models', () => {
  it('returns the adjacent block base', () => {
    expect(getAdjacentBlockBase({ base: 0xc0a80000, size: 256, count: 1 })).toBe(0xc0a80100);
    expect(getAdjacentBlockBase({ base: 0xc0a80000, size: 256, count: -1 })).toBe(0xc0a7ff00);
  });

  it('does not wrap around the address space', () => {
    expect(getAdjacentBlockBase({ base: 0xffffff00, size: 256, count: 1 })).toBeNull();
    expect(getAdjacentBlockBase({ base: 0, size: 256, count: -1 })).toBeNull();
    expect(getAdjacentBlockBase({ base: 0, size: 2 ** 32, count: 1 })).toBeNull();
    expect(getAdjacentBlockBase({ base: 0x80000000, size: 2 ** 31, count: -1 })).toBe(0);
  });

  it('classifies addresses', () => {
    expect(getIPClass({ ip: '10.0.0.1' })).toBe('A');
    expect(getIPClass({ ip: '172.16.0.1' })).toBe('B');
    expect(getIPClass({ ip: '192.168.0.1' })).toBe('C');
  });
});
