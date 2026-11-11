import { describe, expect, it } from 'vitest';
import { ULID_ALPHABET, decodeUlidTime, encodeUlidRandom, encodeUlidTime, generateUlid } from './ulid.service';

describe('ulid service', () => {
  it('generates 26-character Crockford base32 strings', () => {
    for (let i = 0; i < 200; i++) {
      const ulid = generateUlid();
      expect(ulid).toHaveLength(26);
      expect(ulid).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/);
      expect([...ulid].every((c) => ULID_ALPHABET.includes(c))).toBe(true);
    }
  });

  it('encodes the timestamp in the first 10 characters (spec example)', () => {
    // https://github.com/ulid/spec: 01ARYZ6S41 is the time part of 01ARYZ6S41TSV4RRFFQ69G5FAV
    expect(decodeUlidTime('01ARYZ6S41TSV4RRFFQ69G5FAV')).toBe(1469918176385);
    expect(encodeUlidTime(1469918176385)).toBe('01ARYZ6S41');
    expect(encodeUlidTime(0)).toBe('0000000000');
    expect(encodeUlidTime(2 ** 48 - 1)).toBe('7ZZZZZZZZZ');
    expect(() => encodeUlidTime(2 ** 48)).toThrow();
  });

  it('round-trips the generation time', () => {
    const now = Date.UTC(2026, 10, 11, 8, 30, 0, 123);
    expect(decodeUlidTime(generateUlid({ now }))).toBe(now);
  });

  it('encodes 80 random bits into 16 characters', () => {
    expect(encodeUlidRandom(new Uint8Array(10))).toBe('0000000000000000');
    expect(encodeUlidRandom(new Uint8Array(10).fill(0xff))).toBe('ZZZZZZZZZZZZZZZZ');
    expect(encodeUlidRandom(Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 1]))).toBe('0000000000000001');
    expect(encodeUlidRandom(Uint8Array.from([0x80, 0, 0, 0, 0, 0, 0, 0, 0, 0]))).toBe('G000000000000000');
  });

  it('uses the injected random source', () => {
    const ulid = generateUlid({ now: 0, getRandomValues: (a) => a.fill(0xff) });
    expect(ulid).toBe('0000000000ZZZZZZZZZZZZZZZZ');
  });

  it('sorts lexicographically by time', () => {
    const times = [0, 1, 31, 32, 1000, 2 ** 40, 1469918176385, Date.now(), 2 ** 48 - 1];
    const ulids = times.map((now) => generateUlid({ now }));
    expect([...ulids].sort()).toEqual(ulids);
  });
});
