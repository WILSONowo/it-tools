import { describe, expect, it } from 'vitest';
import { DECRYPT_ERROR, algos, decryptText, encryptText } from './encryption.service';

describe('encryption service', () => {
  it('round-trips every algorithm', () => {
    for (const algo of Object.keys(algos) as (keyof typeof algos)[]) {
      const cipherText = encryptText({ algo, text: '你好, world', secret: 'k3y' });
      expect(decryptText({ algo, cipherText, secret: 'k3y' })).toEqual({ output: '你好, world' });
    }
  });

  it('decrypts the default sample', () => {
    expect(
      decryptText({
        algo: 'AES',
        cipherText: 'U2FsdGVkX1/EC3+6P5dbbkZ3e1kQ5o2yzuU0NHTjmrKnLBEwreV489Kr0DIB+uBs',
        secret: 'my secret key',
      }).output,
    ).toBe('Lorem ipsum dolor sit amet');
  });

  it('reports an error instead of throwing on a wrong key', () => {
    const cipherText = encryptText({ algo: 'AES', text: 'Lorem ipsum', secret: 'k' });
    for (const secret of ['x', 'y', 'z', 'wrong', 'another wrong key']) {
      expect(decryptText({ algo: 'AES', cipherText, secret })).toEqual({ output: '', error: DECRYPT_ERROR });
    }
  });

  it('reports an error for a wrong Rabbit key that yields malformed UTF-8', () => {
    const cipherText = encryptText({ algo: 'Rabbit', text: 'Hello', secret: 'k' });
    expect(decryptText({ algo: 'Rabbit', cipherText, secret: 'q' }).error).toBe(DECRYPT_ERROR);
  });

  it('returns an empty output for empty input', () => {
    expect(decryptText({ algo: 'AES', cipherText: '  ', secret: 'k' })).toEqual({ output: '' });
  });
});
