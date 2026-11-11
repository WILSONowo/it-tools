import crypto from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { type OaepHash, oaepHashes, rsaDecrypt, rsaEncrypt } from './rsa-encrypt-decrypt.service';

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

const nodeHash: Record<OaepHash, string> = { SHA1: 'sha1', SHA256: 'sha256', SHA384: 'sha384', SHA512: 'sha512' };

describe('rsa-encrypt-decrypt service', () => {
  it('round-trips with PKCS#1 v1.5 in base64 and hex', () => {
    for (const encoding of ['base64', 'hex'] as const) {
      const cipherText = rsaEncrypt({
        publicKeyPem: publicKey,
        plainText: '你好 RSA',
        padding: 'RSAES-PKCS1-V1_5',
        encoding,
      });
      expect(rsaDecrypt({ privateKeyPem: privateKey, cipherText, padding: 'RSAES-PKCS1-V1_5', encoding })).toBe(
        '你好 RSA',
      );
    }
  });

  for (const hash of oaepHashes) {
    it(`OAEP ${hash} interoperates with node crypto`, () => {
      // forge -> node
      const cipherText = rsaEncrypt({
        publicKeyPem: publicKey,
        plainText: 'hello',
        padding: 'RSA-OAEP',
        oaepHash: hash,
      });
      const decrypted = crypto.privateDecrypt(
        { key: privateKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: nodeHash[hash] },
        Buffer.from(cipherText, 'base64'),
      );
      expect(decrypted.toString('utf8')).toBe('hello');

      // node -> forge
      const nodeCipher = crypto.publicEncrypt(
        { key: publicKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: nodeHash[hash] },
        Buffer.from('世界', 'utf8'),
      );
      expect(
        rsaDecrypt({
          privateKeyPem: privateKey,
          cipherText: nodeCipher.toString('base64'),
          padding: 'RSA-OAEP',
          oaepHash: hash,
        }),
      ).toBe('世界');
    });
  }

  it('fails when the OAEP hash does not match', () => {
    const nodeCipher = crypto.publicEncrypt(
      { key: publicKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
      Buffer.from('x'),
    );
    expect(() =>
      rsaDecrypt({
        privateKeyPem: privateKey,
        cipherText: nodeCipher.toString('base64'),
        padding: 'RSA-OAEP',
        oaepHash: 'SHA1',
      }),
    ).toThrow('解密失败');
  });

  it('rejects non-PEM keys and malformed cipher text', () => {
    expect(() => rsaEncrypt({ publicKeyPem: 'abc', plainText: 'x', padding: 'RSA-OAEP' })).toThrow('PEM');
    expect(() =>
      rsaDecrypt({ privateKeyPem: privateKey, cipherText: 'zz', padding: 'RSA-OAEP', encoding: 'hex' }),
    ).toThrow('hex');
  });
});
