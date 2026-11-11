import { compareSync } from 'bcryptjs';
import { describe, expect, it } from 'vitest';
import { bcryptCompare, bcryptHash, isTruncatedByBcrypt, normalizeCost, utf8ByteLength } from './bcrypt.service';

describe('bcrypt service', () => {
  it('normalizes the cost factor', () => {
    expect(normalizeCost(null)).toBe(10);
    expect(normalizeCost(undefined)).toBe(10);
    expect(normalizeCost(Number.NaN)).toBe(10);
    expect(normalizeCost(0)).toBe(4);
    expect(normalizeCost(3)).toBe(4);
    expect(normalizeCost(12)).toBe(12);
    expect(normalizeCost(40)).toBe(31);
    expect(normalizeCost(5.6)).toBe(6);
  });

  it('counts UTF-8 bytes for the 72-byte limit', () => {
    expect(utf8ByteLength('abc')).toBe(3);
    expect(utf8ByteLength('密码')).toBe(6);
    expect(isTruncatedByBcrypt('a'.repeat(72))).toBe(false);
    expect(isTruncatedByBcrypt('a'.repeat(73))).toBe(true);
    expect(isTruncatedByBcrypt('密'.repeat(25))).toBe(true); // 75 bytes but only 25 characters
  });

  it('hashes asynchronously with the requested cost', async () => {
    const progress: number[] = [];
    const hashed = await bcryptHash('hello 世界', 4, (p) => progress.push(p));
    expect(hashed).toMatch(/^\$2a\$04\$/);
    expect(compareSync('hello 世界', hashed)).toBe(true);
    expect(await bcryptCompare('hello 世界', hashed)).toBe(true);
    expect(await bcryptCompare('hello', hashed)).toBe(false);
  });

  it('matches a known OpenBSD test vector', async () => {
    expect(await bcryptCompare('', '$2a$06$DCq7YPn5Rq63x1Lad4cll.TV4S6ytwfsfvkgY8jIucDrjc8deX1s.')).toBe(true);
    expect(await bcryptCompare('U*U', '$2a$05$CCCCCCCCCCCCCCCCCCCCC.E5YPO9kmyuRGyh0XouQYb4YMJKvyOeW')).toBe(true);
  });

  it('returns false for malformed hashes instead of throwing', async () => {
    expect(await bcryptCompare('a', '')).toBe(false);
    expect(await bcryptCompare('a', 'not a hash')).toBe(false);
  });
});
