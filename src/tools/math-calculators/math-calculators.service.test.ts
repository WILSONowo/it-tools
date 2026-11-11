import { describe, expect, it } from 'vitest';
import { gcd, gcdLcm, lcm, parseNumbers } from './math-calculators.service';

describe('math-calculators', () => {
  it('parses number lists without inventing zeros for empty tokens', () => {
    expect(parseNumbers('1, 2, 3,')).toEqual([1, 2, 3]);
    expect(parseNumbers(', 1;;2  3 ,')).toEqual([1, 2, 3]);
    expect(parseNumbers('1, abc, 0')).toEqual([1, 0]);
    expect(parseNumbers('')).toEqual([]);
  });

  it('computes gcd and lcm', () => {
    expect(gcd(12, 18)).toBe(6);
    expect(gcd(-12, 18)).toBe(6);
    expect(gcd(0, 0)).toBe(0);
    expect(lcm(4, 6)).toBe(12);
    expect(lcm(-4, 6)).toBe(12);
    expect(gcdLcm([12, 18, 24])).toEqual({ gcd: 6, lcm: 72 });
  });

  it('returns 0 as the lcm when a zero is present', () => {
    expect(lcm(0, 0)).toBe(0);
    expect(gcdLcm([0, 5])).toEqual({ gcd: 5, lcm: 0 });
    expect(gcdLcm([0, 0])).toEqual({ gcd: 0, lcm: 0 });
    expect(gcdLcm([])).toBeNull();
  });
});
