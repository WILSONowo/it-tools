import { describe, expect, it } from 'vitest';
import { encodeIeee754, parseFloatInput } from './ieee754-converter.service';

describe('ieee754-converter', () => {
  describe('parseFloatInput', () => {
    it('parses numbers and special values', () => {
      expect(parseFloatInput('3.14')).toBe(3.14);
      expect(Object.is(parseFloatInput('-0'), -0)).toBe(true);
      expect(parseFloatInput('1e10')).toBe(1e10);
      expect(parseFloatInput('NaN')).toBeNaN();
      expect(parseFloatInput('Infinity')).toBe(Infinity);
      expect(parseFloatInput('-infinity')).toBe(-Infinity);
      expect(parseFloatInput('+inf')).toBe(Infinity);
    });

    it('rejects invalid input', () => {
      expect(parseFloatInput('')).toBeNull();
      expect(parseFloatInput('abc')).toBeNull();
      expect(parseFloatInput('1.2.3')).toBeNull();
    });
  });

  describe('encodeIeee754', () => {
    it('encodes normal numbers', () => {
      const f32 = encodeIeee754(3.14, false);
      expect(f32.hex).toBe('0x4048f5c3');
      expect(f32.exponent).toBe('1');
      expect(f32.storedValue).toBe('3.140000104904175');
      expect(f32.kind).toBe('normal');

      const f64 = encodeIeee754(3.14, true);
      expect(f64.hex).toBe('0x40091eb851eb851f');
      expect(f64.storedValue).toBe('3.14');
      expect(f64.bits).toHaveLength(64);
    });

    it('explains zero and subnormal exponents', () => {
      expect(encodeIeee754(0, false).exponent).toBe('0(零)');
      const negativeZero = encodeIeee754(-0, true);
      expect(negativeZero.sign).toBe('1');
      expect(negativeZero.hex).toBe('0x8000000000000000');
      expect(negativeZero.storedValue).toBe('-0');

      expect(encodeIeee754(1e-40, false).exponent).toBe('0(非规格化数,指数按 -126 计)');
      expect(encodeIeee754(5e-324, true).exponent).toBe('0(非规格化数,指数按 -1022 计)');
      expect(encodeIeee754(5e-324, true).kind).toBe('subnormal');
    });

    it('shows float32 overflow as Infinity', () => {
      const f32 = encodeIeee754(1e39, false);
      expect(f32.kind).toBe('infinity');
      expect(f32.overflow).toBe(true);
      expect(f32.storedValue).toBe('Infinity');
      expect(f32.hex).toBe('0x7f800000');
      expect(encodeIeee754(1e39, true).overflow).toBe(false);
    });

    it('encodes NaN and Infinity', () => {
      expect(encodeIeee754(Number.NaN, false).kind).toBe('nan');
      expect(encodeIeee754(Number.NaN, true).exponentBits).toBe('11111111111');
      expect(encodeIeee754(-Infinity, true).hex).toBe('0xfff0000000000000');
      expect(encodeIeee754(-Infinity, true).overflow).toBe(false);
    });
  });
});
