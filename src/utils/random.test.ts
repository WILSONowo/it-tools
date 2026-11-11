import { describe, expect, it } from 'vitest';
import { randIntFromInterval } from './random';

describe('randIntFromInterval', () => {
  it('returns every integer in [min, max], both ends included', () => {
    const seen = new Set<number>();
    for (let i = 0; i < 2000; i++) {
      const value = randIntFromInterval(0, 2);
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(2);
      seen.add(value);
    }
    expect([...seen].sort()).toEqual([0, 1, 2]);
  });

  it('returns min when min equals max', () => {
    expect(randIntFromInterval(5, 5)).toBe(5);
  });
});
