import { expect, describe, it } from 'vitest';
import { convertBase } from './integer-base-converter.model';

describe('integer-base-converter', () => {
  describe('convertBase', () => {
    describe('when the input and target bases are between 2 and 64', () => {
      it('should convert integer between different bases', () => {
        expect(convertBase({ value: '0', fromBase: 2, toBase: 11 })).toEqual('0');
        expect(convertBase({ value: '0', fromBase: 5, toBase: 2 })).toEqual('0');
        expect(convertBase({ value: '0', fromBase: 10, toBase: 16 })).toEqual('0');
        expect(convertBase({ value: '10100101', fromBase: 2, toBase: 16 })).toEqual('a5');
        expect(convertBase({ value: '192654', fromBase: 10, toBase: 8 })).toEqual('570216');
        expect(convertBase({ value: 'zz', fromBase: 64, toBase: 10 })).toEqual('2275');
      });
    });

    it('keeps full precision for values above 2^53', () => {
      expect(convertBase({ value: '18446744073709551615', fromBase: 10, toBase: 16 })).toEqual('ffffffffffffffff');
      expect(convertBase({ value: 'ffffffffffffffff', fromBase: 16, toBase: 10 })).toEqual('18446744073709551615');
      expect(convertBase({ value: '9007199254740993', fromBase: 10, toBase: 10 })).toEqual('9007199254740993');
    });

    it('accepts upper and lower case digits for bases up to 36', () => {
      expect(convertBase({ value: 'FF', fromBase: 16, toBase: 10 })).toEqual('255');
      expect(convertBase({ value: 'fF', fromBase: 16, toBase: 10 })).toEqual('255');
      expect(convertBase({ value: 'Z', fromBase: 36, toBase: 10 })).toEqual('35');
    });

    it('is case sensitive above base 36', () => {
      expect(convertBase({ value: 'a', fromBase: 62, toBase: 10 })).toEqual('10');
      expect(convertBase({ value: 'A', fromBase: 62, toBase: 10 })).toEqual('36');
    });

    it('rejects invalid digits with a clear error', () => {
      expect(() => convertBase({ value: '102', fromBase: 2, toBase: 10 })).toThrow('数字 "2" 对于 2 进制无效。');
      expect(() => convertBase({ value: '1g', fromBase: 16, toBase: 10 })).toThrow('数字 "g" 对于 16 进制无效。');
      expect(() => convertBase({ value: '1.5', fromBase: 10, toBase: 2 })).toThrow('数字 "." 对于 10 进制无效。');
      expect(() => convertBase({ value: '', fromBase: 10, toBase: 2 })).toThrow();
      expect(() => convertBase({ value: '1', fromBase: 10, toBase: 65 })).toThrow();
    });

    it('supports negative numbers and surrounding whitespace', () => {
      expect(convertBase({ value: ' -255 ', fromBase: 10, toBase: 16 })).toEqual('-ff');
      expect(convertBase({ value: '-0', fromBase: 10, toBase: 16 })).toEqual('0');
    });
  });
});
