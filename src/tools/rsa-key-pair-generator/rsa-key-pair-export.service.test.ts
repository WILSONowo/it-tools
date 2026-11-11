import { describe, expect, it } from 'vitest';
import JSZip from 'jszip';
import { buildKeyPairZip, isInsecureKeySize, pemToHex } from './rsa-key-pair-export.service';

describe('rsa-key-pair-export service', () => {
  it('flags key sizes below 2048 bits as insecure', () => {
    expect(isInsecureKeySize(512)).toBe(true);
    expect(isInsecureKeySize(1024)).toBe(true);
    expect(isInsecureKeySize(2048)).toBe(false);
    expect(isInsecureKeySize(4096)).toBe(false);
  });

  it('converts a PEM body to hex DER', () => {
    expect(pemToHex('-----BEGIN PUBLIC KEY-----\nAQID\nBA==\n-----END PUBLIC KEY-----\n')).toBe('01020304');
  });

  it('builds a real zip archive with both keys', async () => {
    const blob = await buildKeyPairZip({ publicKey: 'PUB', privateKey: 'PRIV', format: 'PEM' });
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());
    expect(Object.keys(zip.files).sort()).toEqual(['rsa_private.pem', 'rsa_public.pem']);
    expect(await zip.file('rsa_public.pem')?.async('string')).toBe('PUB');
    expect(await zip.file('rsa_private.pem')?.async('string')).toBe('PRIV');

    const hexZip = await JSZip.loadAsync(
      await (await buildKeyPairZip({ publicKey: 'a', privateKey: 'b', format: 'HEX' })).arrayBuffer(),
    );
    expect(Object.keys(hexZip.files).sort()).toEqual(['rsa_private.hex.txt', 'rsa_public.hex.txt']);
  });
});
