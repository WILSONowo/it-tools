import { Blob as NodeBlob } from 'node:buffer';
import crypto from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  FILE_HASH_ALGORITHMS,
  HashCancelledError,
  MAX_FILE_SIZE,
  getFileSizeError,
  hashBlob,
} from './file-hash.service';

const nodeNames = {
  MD5: 'md5',
  'SHA-1': 'sha1',
  'SHA-224': 'sha224',
  'SHA-256': 'sha256',
  'SHA-384': 'sha384',
  'SHA-512': 'sha512',
  'SHA3-256': 'sha3-256',
  SM3: 'sm3',
} as const;

const data = crypto.randomBytes(1000 + 37);
const blob = new NodeBlob([data]) as unknown as Blob;

describe('file-hash service', () => {
  it('matches node crypto for every algorithm when streaming in odd-sized chunks', async () => {
    const progress: number[] = [];
    const rows = await hashBlob({ blob, chunkSize: 100, onProgress: (r) => progress.push(r) });

    expect(rows.map((r) => r.algorithm)).toEqual([...FILE_HASH_ALGORITHMS]);
    for (const { algorithm, hash } of rows) {
      expect(hash).toBe(crypto.createHash(nodeNames[algorithm]).update(data).digest('hex'));
    }

    expect(progress[0]).toBe(0);
    expect(progress[progress.length - 1]).toBe(1);
    expect([...progress].sort((a, b) => a - b)).toEqual(progress);
    expect(progress.length).toBeGreaterThan(10);
  });

  it('hashes an empty file', async () => {
    const rows = await hashBlob({ blob: new NodeBlob([]) as unknown as Blob, algorithms: ['SHA-256'] });
    expect(rows).toEqual([
      { algorithm: 'SHA-256', hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' },
    ]);
  });

  it('stops when cancelled', async () => {
    let calls = 0;
    await expect(
      hashBlob({ blob, chunkSize: 100, algorithms: ['MD5'], isCancelled: () => ++calls > 3 }),
    ).rejects.toBeInstanceOf(HashCancelledError);
  });

  it('enforces the 1GB limit', () => {
    expect(getFileSizeError(MAX_FILE_SIZE)).toBeUndefined();
    expect(getFileSizeError(MAX_FILE_SIZE + 1)).toContain('1GB');
  });
});
