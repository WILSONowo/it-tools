import { describe, expect, it } from 'vitest';
import { numberToRmbCapital, rmbCapitalToNumber } from './rmb-case.service';

describe('rmb-case', () => {
  describe('numberToRmbCapital', () => {
    it('converts common amounts', () => {
      expect(numberToRmbCapital('0')).toBe('零元整');
      expect(numberToRmbCapital('1')).toBe('壹元整');
      expect(numberToRmbCapital('10')).toBe('壹拾元整');
      expect(numberToRmbCapital('1001')).toBe('壹仟零壹元整');
      expect(numberToRmbCapital('10000')).toBe('壹万元整');
      expect(numberToRmbCapital('101000')).toBe('壹拾万壹仟元整');
      expect(numberToRmbCapital('10001')).toBe('壹万零壹元整');
      expect(numberToRmbCapital('123456789.12')).toBe('壹亿贰仟叁佰肆拾伍万陆仟柒佰捌拾玖元壹角贰分');
      expect(numberToRmbCapital('0.05')).toBe('零元零伍分');
      expect(numberToRmbCapital('0.2')).toBe('零元贰角');
    });

    it('inserts a zero when a whole 万 section is skipped', () => {
      expect(numberToRmbCapital('100001000')).toBe('壹亿零壹仟元整');
      expect(numberToRmbCapital('100010000')).toBe('壹亿零壹万元整');
      expect(numberToRmbCapital('100000000')).toBe('壹亿元整');
      expect(numberToRmbCapital('1000000000001')).toBe('壹万亿零壹元整');
    });

    it('rejects invalid input', () => {
      expect(() => numberToRmbCapital('')).toThrow();
      expect(() => numberToRmbCapital('-1')).toThrow();
      expect(() => numberToRmbCapital('1.234')).toThrow();
      expect(() => numberToRmbCapital('1234567890123456')).toThrow();
    });
  });

  describe('rmbCapitalToNumber', () => {
    it('parses capital amounts', () => {
      expect(rmbCapitalToNumber('壹亿零壹仟元整')).toBe('100001000');
      expect(rmbCapitalToNumber('人民币壹仟零壹元整')).toBe('1001');
      expect(rmbCapitalToNumber('壹元伍角')).toBe('1.5');
      expect(rmbCapitalToNumber('零元零伍分')).toBe('0.05');
      expect(rmbCapitalToNumber('拾元整')).toBe('10');
    });

    it('parses jiao/fen without 元', () => {
      expect(rmbCapitalToNumber('贰角')).toBe('0.2');
      expect(rmbCapitalToNumber('伍分')).toBe('0.05');
      expect(rmbCapitalToNumber('贰角伍分')).toBe('0.25');
    });

    it('round-trips large amounts without float error', () => {
      for (const value of ['999999999999999.99', '123456789012345.67', '0.01', '100001000', '1000000000001.1']) {
        expect(rmbCapitalToNumber(numberToRmbCapital(value))).toBe(value);
      }
    });

    it('rejects garbage', () => {
      expect(() => rmbCapitalToNumber('')).toThrow();
      expect(() => rmbCapitalToNumber('abc')).toThrow();
      expect(() => rmbCapitalToNumber('壹元abc')).toThrow();
    });
  });
});
