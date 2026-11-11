import { describe, expect, it } from 'vitest';
import {
  bytesToHex,
  decode16,
  decode32,
  decode58,
  decode62,
  decode85,
  encode16,
  encode32,
  encode58,
  encode62,
  encode85,
  hexToBytes,
  utf8ToBytes,
} from './base.service';

const bytes = (...values: number[]) => new Uint8Array(values);

describe('base.service', () => {
  describe('base58', () => {
    it('follows the Bitcoin convention for leading zero bytes', () => {
      expect(encode58(bytes(0))).toBe('1');
      expect(encode58(bytes(0, 0))).toBe('11');
      expect(encode58(bytes())).toBe('');
      expect(encode58(hexToBytes('00010203'))).toBe('1Ldp');
      expect(Array.from(decode58('1'))).toEqual([0]);
      expect(Array.from(decode58('11'))).toEqual([0, 0]);
      expect(bytesToHex(decode58('1Ldp'))).toBe('00010203');
    });

    it('encodes known vectors', () => {
      expect(encode58(utf8ToBytes('Hello World!'))).toBe('2NEpo7TZRRrLZSi2U');
      expect(new TextDecoder().decode(decode58('2NEpo7TZRRrLZSi2U'))).toBe('Hello World!');
    });

    it('rejects invalid characters', () => {
      expect(() => decode58('0OIl')).toThrow();
    });
  });

  describe('base62', () => {
    it('round-trips leading zero bytes', () => {
      for (const value of [bytes(0), bytes(0, 0, 1), bytes(255, 0), bytes(0, 255, 255), bytes()]) {
        expect(Array.from(decode62(encode62(value)))).toEqual(Array.from(value));
      }
      expect(encode62(bytes(0))).toBe('0');
      expect(encode62(bytes(61))).toBe('z');
      expect(encode62(bytes(10))).toBe('A');
    });
  });

  it('round-trips base16, base32 and base85', () => {
    const data = utf8ToBytes('Hello IT-Tools! 中文 \u0000');
    expect(Array.from(decode16(encode16(data)))).toEqual(Array.from(data));
    expect(Array.from(decode32(encode32(data)))).toEqual(Array.from(data));
    expect(Array.from(decode85(encode85(data)))).toEqual(Array.from(data));
    expect(encode32(utf8ToBytes('foobar'))).toBe('MZXW6YTBOI======');
  });
});
