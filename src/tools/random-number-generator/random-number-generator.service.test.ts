import { describe, expect, it } from 'vitest';
import { generateRandomNumbers } from './random-number-generator.service';

const base = { type: 'int' as 'int' | 'float', decimals: 2, min: 1, max: 100, count: 10, unique: false };

function values(options: Partial<typeof base>) {
  const result = generateRandomNumbers({ ...base, ...options });
  if (!result.ok) throw new Error(result.error);
  return result.values;
}

describe('generateRandomNumbers', () => {
  it('generates integers in [min, max)', () => {
    const list = values({ min: 0, max: 3, count: 500 }).map(Number);
    expect(new Set(list)).toEqual(new Set([0, 1, 2]));
  });

  it('never reaches the excluded max in float mode', () => {
    const list = values({ type: 'float', decimals: 1, min: 0, max: 0.2, count: 500 });
    expect(new Set(list)).toEqual(new Set(['0.0', '0.1']));
    for (const v of values({ type: 'float', decimals: 2, min: 0.98, max: 1, count: 200 })) {
      expect(Number(v)).toBeLessThan(1);
      expect(['0.98', '0.99']).toContain(v);
    }
  });

  it('keeps 20-decimal floats below max', () => {
    for (const v of values({ type: 'float', decimals: 20, min: 0, max: 1e-10, count: 100 })) {
      expect(Number(v)).toBeLessThan(1e-10);
    }
  });

  it('generates unique values, covering the whole range when asked', () => {
    const list = values({ min: 5, max: 15, count: 10, unique: true });
    expect([...list].map(Number).sort((a, b) => a - b)).toEqual([5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
    const floats = values({ type: 'float', decimals: 1, min: 0, max: 1, count: 10, unique: true });
    expect(new Set(floats).size).toBe(10);
  });

  it('reports when the range is too small for unique values', () => {
    const result = generateRandomNumbers({ ...base, min: 1, max: 5, count: 10, unique: true });
    expect(result).toEqual({ ok: false, error: '该范围内只有 4 个不同的值,无法生成 10 个不重复的数' });
  });

  it('validates the bounds', () => {
    expect(generateRandomNumbers({ ...base, min: 5, max: 5 }).ok).toBe(false);
    expect(generateRandomNumbers({ ...base, min: 0.2, max: 0.8 }).ok).toBe(false);
    expect(generateRandomNumbers({ ...base, max: null as unknown as number }).ok).toBe(false);
  });
});
