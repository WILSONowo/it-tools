import { describe, expect, it } from 'vitest';
import { CHARSETS, MAX_TOTAL_CHARS, generateBatch, planGenerator } from './password-generator.service';

describe('planGenerator', () => {
  it('builds the pool from selected charsets, include and exclude', () => {
    const plan = planGenerator({ charsets: ['number'], include: 'xy', exclude: '0x', length: 8, count: 1 });
    expect(plan.pool).not.toContain('0');
    expect(plan.pool).not.toContain('x');
    expect(plan.pool).toContain('y');
    expect(plan.pool).toHaveLength(10);
    expect(plan.required).toEqual([['y'], [...'123456789']]);
  });
});

describe('generateBatch', () => {
  it('generates the requested count and length', () => {
    const { values, warning } = generateBatch({ charsets: ['lower', 'upper'], length: 20, count: 50 });
    expect(warning).toBeUndefined();
    expect(values).toHaveLength(50);
    expect(new Set(values).size).toBe(50);
    for (const value of values) expect(value).toMatch(/^[a-zA-Z]{20}$/);
  });

  it('always contains every selected class and every include character', () => {
    const { values } = generateBatch({
      charsets: ['lower', 'upper', 'number', 'symbol'],
      include: '中@',
      length: 6,
      count: 500,
    });
    for (const value of values) {
      expect([...value]).toHaveLength(6);
      expect(value).toMatch(/[a-z]/);
      expect(value).toMatch(/[A-Z]/);
      expect(value).toMatch(/[0-9]/);
      expect(value).toContain('中');
      expect(value).toContain('@');
    }
  });

  it('never uses excluded characters', () => {
    const { values } = generateBatch({ charsets: ['number'], exclude: '0123456', length: 30, count: 20 });
    for (const value of values) expect(value).toMatch(/^[789]+$/);
  });

  it('keeps lengths within [length, lengthMax]', () => {
    const lengths = new Set(
      generateBatch({ charsets: ['lower'], length: 4, lengthMax: 6, count: 300 }).values.map((v) => v.length),
    );
    expect([...lengths].sort()).toEqual([4, 5, 6]);
  });

  it('uses every character of the pool', () => {
    const joined = generateBatch({ charsets: ['upper', 'lower'], length: 200, count: 20 }).values.join('');
    expect(new Set(joined).size).toBe(CHARSETS.upper.length + CHARSETS.lower.length);
  });

  it('warns instead of freezing on huge requests or empty pools', () => {
    expect(generateBatch({ charsets: [], length: 10, count: 1 }).warning).toBeTruthy();
    const huge = generateBatch({ charsets: ['lower'], length: MAX_TOTAL_CHARS, count: 2 });
    expect(huge.values).toHaveLength(0);
    expect(huge.warning).toBeTruthy();
  });

  it('warns when unique results run out', () => {
    const { values, warning } = generateBatch({ charsets: ['number'], length: 1, count: 20 });
    expect(values).toHaveLength(10);
    expect(warning).toContain('仅生成了 10 个');
  });
});
