import { describe, expect, it } from 'vitest';
import { findLossyJsonValues, getLossyJsonWarning, sortObjectKeys } from './json.models';

describe('json models', () => {
  describe('sortObjectKeys', () => {
    it('the object keys are recursively sorted alphabetically', () => {
      expect(JSON.stringify(sortObjectKeys({ b: 2, a: 1 }))).to.deep.equal(JSON.stringify({ a: 1, b: 2 }));
      // To unsure that this way of testing is working
      expect(JSON.stringify(sortObjectKeys({ b: 2, a: 1 }))).to.not.deep.equal(JSON.stringify({ b: 2, a: 1 }));

      expect(JSON.stringify(sortObjectKeys({ b: 2, a: 1, d: { j: 7, a: [{ z: 9, y: 8 }] }, c: 3 }))).to.deep.equal(
        JSON.stringify({ a: 1, b: 2, c: 3, d: { a: [{ y: 8, z: 9 }], j: 7 } }),
      );
    });
  });

  describe('findLossyJsonValues', () => {
    it('finds integers beyond Number.MAX_SAFE_INTEGER', () => {
      expect(findLossyJsonValues('{"id": 12345678901234567890, "ok": 9007199254740991}')).toEqual({
        unsafeIntegers: ['12345678901234567890'],
        nonFinite: [],
      });
      expect(findLossyJsonValues('[-9007199254740993, 0x20000000000001]').unsafeIntegers).toEqual([
        '-9007199254740993',
        '0x20000000000001',
      ]);
    });

    it('finds NaN, Infinity and overflowing numbers', () => {
      expect(findLossyJsonValues('{a: NaN, b: -Infinity, c: 1e400, d: 1.5e10}').nonFinite).toEqual([
        'NaN',
        '-Infinity',
        '1e400',
      ]);
    });

    it('ignores strings, comments and keys', () => {
      const source = `{
        // 12345678901234567890 NaN
        /* Infinity */
        "big": "12345678901234567890",
        'single': 'NaN \\' 99999999999999999999',
        NaN: 1,
        Infinity : 2,
        key123: 3
      }`;
      expect(findLossyJsonValues(source)).toEqual({ unsafeIntegers: [], nonFinite: [] });
    });
  });

  it('builds a warning message', () => {
    expect(getLossyJsonWarning('{"a": 1}')).toBe('');
    expect(getLossyJsonWarning('[12345678901234567890]')).toContain('丢失精度');
    expect(getLossyJsonWarning('[NaN]')).toContain('null');
  });
});
