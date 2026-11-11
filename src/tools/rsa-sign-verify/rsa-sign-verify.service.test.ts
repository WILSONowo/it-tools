import crypto from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { rsaSign, rsaVerify, signHashes } from './rsa-sign-verify.service';

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 1024,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

describe('rsa-sign-verify service', () => {
  for (const hash of signHashes) {
    it(`${hash} signatures match node crypto`, () => {
      const signature = rsaSign({ privateKeyPem: privateKey, message: '你好', hash });
      expect(signature).toBe(crypto.sign(hash.toLowerCase(), Buffer.from('你好'), privateKey).toString('base64'));
      expect(rsaVerify({ publicKeyPem: publicKey, message: '你好', signature, hash })).toBe(true);
      expect(rsaVerify({ publicKeyPem: publicKey, message: '你好!', signature, hash })).toBe(false);
    });
  }

  it('supports hex signatures', () => {
    const signature = rsaSign({ privateKeyPem: privateKey, message: 'abc', hash: 'SHA256', encoding: 'hex' });
    expect(signature).toMatch(/^[0-9a-f]{256}$/);
    expect(rsaVerify({ publicKeyPem: publicKey, message: 'abc', signature, hash: 'SHA256', encoding: 'hex' })).toBe(
      true,
    );
  });

  it('treats a wrong-length signature as a mismatch instead of throwing', () => {
    expect(rsaVerify({ publicKeyPem: publicKey, message: 'abc', signature: 'AAAA', hash: 'SHA256' })).toBe(false);
    expect(
      rsaVerify({ publicKeyPem: publicKey, message: 'abc', signature: 'abcd', hash: 'SHA256', encoding: 'hex' }),
    ).toBe(false);
  });

  it('rejects malformed signature encodings', () => {
    expect(() =>
      rsaVerify({ publicKeyPem: publicKey, message: 'abc', signature: 'xyz', hash: 'SHA256', encoding: 'hex' }),
    ).toThrow('hex');
  });
});
