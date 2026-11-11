import { describe, expect, it } from 'vitest';
import { randFromArray, randIntFromInterval, random, randomString, secureRandomInt, shuffleArray } from './random';

describe('random', () => {
  it('returns floats in [0, 1)', () => {
    for (let i = 0; i < 1000; i++) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe('secureRandomInt', () => {
  it('returns every integer in [0, max)', () => {
    const seen = new Set<number>();
    for (let i = 0; i < 2000; i++) {
      const value = secureRandomInt(5);
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(5);
      seen.add(value);
    }
    expect(seen.size).toBe(5);
  });

  it('is roughly uniform', () => {
    const counts = [0, 0, 0];
    const n = 30000;
    for (let i = 0; i < n; i++) counts[secureRandomInt(3)]++;
    for (const count of counts) {
      expect(Math.abs(count - n / 3)).toBeLessThan(n * 0.03);
    }
  });

  it('rejects invalid bounds', () => {
    expect(() => secureRandomInt(0)).toThrow();
    expect(() => secureRandomInt(1.5)).toThrow();
    expect(secureRandomInt(1)).toBe(0);
  });
});

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

  it('handles negative and very large ranges', () => {
    for (let i = 0; i < 200; i++) {
      const negative = randIntFromInterval(-9999, 99999);
      expect(negative).toBeGreaterThanOrEqual(-9999);
      expect(negative).toBeLessThanOrEqual(99999);
      const large = randIntFromInterval(0, Date.now());
      expect(large).toBeGreaterThanOrEqual(0);
      expect(large).toBeLessThanOrEqual(Date.now());
    }
  });
});

describe('randFromArray / randomString / shuffleArray', () => {
  it('picks from the array', () => {
    const items = ['a', 'b', 'c'];
    const seen = new Set<string>();
    for (let i = 0; i < 500; i++) seen.add(randFromArray(items));
    expect([...seen].sort()).toEqual(items);
  });

  it('builds strings from the alphabet', () => {
    expect(randomString('abc', 0)).toBe('');
    expect(randomString('', 10)).toBe('');
    const value = randomString('xyz', 300);
    expect(value).toHaveLength(300);
    expect(value).toMatch(/^[xyz]+$/);
    expect(new Set(value).size).toBe(3);
  });

  it('keeps all elements when shuffling', () => {
    const items = Array.from({ length: 50 }, (_, i) => i);
    expect(shuffleArray(items).sort((a, b) => a - b)).toEqual(items);
  });
});
