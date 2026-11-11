import JSON5 from 'json5';
import { describe, expect, it } from 'vitest';
import { findNonFiniteNumbers, getJson5TypeLabel } from './json5-formatter.service';

describe('json5-formatter', () => {
  it('labels null separately from objects', () => {
    expect(getJson5TypeLabel(null)).toBe('空值 (null)');
    expect(getJson5TypeLabel({})).toBe('对象');
    expect(getJson5TypeLabel([])).toBe('数组');
    expect(getJson5TypeLabel(1)).toBe('数字');
  });

  it('finds Infinity, -Infinity and NaN values', () => {
    const value = JSON5.parse('{ a: Infinity, b: [1, -Infinity], "c d": { e: NaN }, f: 2 }');
    expect(findNonFiniteNumbers(value)).toEqual(['$.a (Infinity)', '$.b[1] (-Infinity)', '$["c d"].e (NaN)']);
    expect(findNonFiniteNumbers(JSON5.parse('NaN'))).toEqual(['$ (NaN)']);
    expect(findNonFiniteNumbers({ a: 1, b: 'Infinity' })).toEqual([]);
  });
});
