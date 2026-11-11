import { describe, expect, it } from 'vitest';
import {
  bytesToEndianIntegers,
  integerToEndianBytes,
  parseHexBytes,
  parseUnsignedInteger,
} from './endian-converter.service';

describe('endian-converter', () => {
  describe('parseUnsignedInteger', () => {
    it('parses decimal and 0x hexadecimal', () => {
      expect(parseUnsignedInteger('10')).toBe(BigInt(10));
      expect(parseUnsignedInteger('0x10')).toBe(BigInt(16));
      expect(parseUnsignedInteger(' 0X1f ')).toBe(BigInt(31));
      expect(parseUnsignedInteger('0x12345678')).toBe(BigInt(305419896));
    });

    it('rejects invalid input', () => {
      expect(() => parseUnsignedInteger('')).toThrow();
      expect(() => parseUnsignedInteger('-1')).toThrow('负数');
      expect(() => parseUnsignedInteger('0xZZ')).toThrow();
      expect(() => parseUnsignedInteger('12ab')).toThrow();
      expect(() => parseUnsignedInteger('1.5')).toThrow();
    });
  });

  describe('integerToEndianBytes', () => {
    it('converts to big and little endian bytes', () => {
      expect(integerToEndianBytes('305419896', 4)).toEqual({ bigEndian: '12 34 56 78', littleEndian: '78 56 34 12' });
      expect(integerToEndianBytes('0x10', 2)).toEqual({ bigEndian: '00 10', littleEndian: '10 00' });
    });

    it('rejects values out of range', () => {
      expect(() => integerToEndianBytes('256', 1)).toThrow('超出');
      expect(integerToEndianBytes('0xffffffffffffffff', 8).bigEndian).toBe('ff ff ff ff ff ff ff ff');
    });
  });

  describe('bytes to integers', () => {
    it('reads space separated bytes', () => {
      expect(bytesToEndianIntegers('12 34 56 78')).toEqual({ bigEndian: '305419896', littleEndian: '2018915346' });
    });

    it('reads contiguous hex and left-pads odd lengths', () => {
      expect(parseHexBytes('0x12345678')).toEqual([0x12, 0x34, 0x56, 0x78]);
      expect(parseHexBytes('123')).toEqual([0x01, 0x23]);
      expect(bytesToEndianIntegers('1')).toEqual({ bigEndian: '1', littleEndian: '1' });
    });

    it('rejects invalid bytes', () => {
      expect(() => parseHexBytes('')).toThrow();
      expect(() => parseHexBytes('12 345')).toThrow();
      expect(() => parseHexBytes('zz')).toThrow();
    });
  });
});
