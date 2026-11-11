import { describe, expect, it } from 'vitest';
import { argon2Compare, argon2Hash, getArgon2ParamsError } from './argon2.service';

describe('argon2 service', () => {
  it('validates parameters', () => {
    expect(getArgon2ParamsError({ iterations: 3, memorySize: 64, hashLength: 32 })).toBeUndefined();
    expect(getArgon2ParamsError({ iterations: 0, memorySize: 64, hashLength: 32 })).toContain('迭代次数');
    expect(getArgon2ParamsError({ iterations: null, memorySize: 64, hashLength: 32 })).toContain('迭代次数');
    expect(getArgon2ParamsError({ iterations: 1, memorySize: 4, hashLength: 32 })).toContain('内存大小');
    expect(getArgon2ParamsError({ iterations: 1, memorySize: null, hashLength: 32 })).toContain('内存大小');
    expect(getArgon2ParamsError({ iterations: 1, memorySize: 2 ** 21, hashLength: 32 })).toContain('1 GiB');
    expect(getArgon2ParamsError({ iterations: 1, memorySize: 64, hashLength: 2 })).toContain('哈希长度');
  });

  it('returns an error and an empty hash for invalid parameters', async () => {
    expect(await argon2Hash({ password: 'x', iterations: 0, memorySize: 64, hashLength: 32 })).toEqual({
      hash: '',
      error: '迭代次数必须是大于等于 1 的整数',
    });
  });

  it('hashes deterministically for a given salt and verifies', async () => {
    const salt = new TextEncoder().encode('somesaltsomesalt');
    const { hash } = await argon2Hash({ password: 'password', iterations: 2, memorySize: 64, hashLength: 32, salt });
    // reference value from node:crypto argon2Sync('argon2id', ...)
    expect(hash).toBe('$argon2id$v=19$m=64,t=2,p=1$c29tZXNhbHRzb21lc2FsdA$Gpj7qOY5RCXJvcMzqcdQqvgR3wcPX7SleI4c9NtXk6E');
    const again = await argon2Hash({ password: 'password', iterations: 2, memorySize: 64, hashLength: 32, salt });
    expect(again.hash).toBe(hash);

    expect(await argon2Compare({ password: 'password', hash })).toEqual({ match: true });
    expect(await argon2Compare({ password: 'Password', hash })).toEqual({ match: false });
  });

  it('reports malformed hashes instead of silently failing', async () => {
    expect(await argon2Compare({ password: 'a', hash: '' })).toEqual({ match: false });
    expect((await argon2Compare({ password: 'a', hash: 'nope' })).error).toBeDefined();
    expect((await argon2Compare({ password: 'a', hash: '$argon2id$v=19$m=x' })).error).toBeDefined();
  });
});
