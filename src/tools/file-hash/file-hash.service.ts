import {
  createMD5,
  createSHA1,
  createSHA224,
  createSHA256,
  createSHA3,
  createSHA384,
  createSHA512,
  createSM3,
} from 'hash-wasm';

export const FILE_HASH_ALGORITHMS = [
  'MD5',
  'SHA-1',
  'SHA-224',
  'SHA-256',
  'SHA-384',
  'SHA-512',
  'SHA3-256',
  'SM3',
] as const;
export type FileHashAlgorithm = (typeof FILE_HASH_ALGORITHMS)[number];

type IHasher = Awaited<ReturnType<typeof createMD5>>;

export const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1 GiB
export const DEFAULT_CHUNK_SIZE = 4 * 1024 * 1024; // 4 MiB

const hasherFactories: Record<FileHashAlgorithm, () => Promise<IHasher>> = {
  MD5: createMD5,
  'SHA-1': createSHA1,
  'SHA-224': createSHA224,
  'SHA-256': createSHA256,
  'SHA-384': createSHA384,
  'SHA-512': createSHA512,
  'SHA3-256': () => createSHA3(256),
  SM3: createSM3,
};

export function getFileSizeError(size: number): string | undefined {
  if (size > MAX_FILE_SIZE) {
    return '文件超过 1GB 上限,请选择更小的文件';
  }
  return undefined;
}

export class HashCancelledError extends Error {
  constructor() {
    super('cancelled');
    this.name = 'HashCancelledError';
  }
}

function readChunk(blob: Blob): Promise<ArrayBuffer> {
  if (typeof blob.arrayBuffer === 'function') {
    return blob.arrayBuffer();
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

const yieldToEventLoop = () => new Promise<void>((resolve) => setTimeout(resolve));

/**
 * 按块读取文件并把每一块同时喂给所有哈希器,避免把整个文件读入内存,
 * 每块之间让出事件循环以保持页面响应。
 * `isCancelled` 返回 true 时抛出 HashCancelledError(用于用户又选了另一个文件的情况)。
 */
export async function hashBlob({
  blob,
  algorithms = FILE_HASH_ALGORITHMS,
  chunkSize = DEFAULT_CHUNK_SIZE,
  onProgress,
  isCancelled = () => false,
}: {
  blob: Blob;
  algorithms?: readonly FileHashAlgorithm[];
  chunkSize?: number;
  onProgress?: (ratio: number) => void;
  isCancelled?: () => boolean;
}): Promise<{ algorithm: FileHashAlgorithm; hash: string }[]> {
  const hashers = await Promise.all(
    algorithms.map(async (algorithm) => {
      const hasher = await hasherFactories[algorithm]();
      hasher.init();
      return { algorithm, hasher };
    }),
  );

  onProgress?.(0);
  for (let offset = 0; offset < blob.size; offset += chunkSize) {
    if (isCancelled()) {
      throw new HashCancelledError();
    }

    const chunk = new Uint8Array(await readChunk(blob.slice(offset, offset + chunkSize)));
    for (const { hasher } of hashers) {
      hasher.update(chunk);
    }

    onProgress?.(Math.min(1, (offset + chunk.length) / blob.size));
    await yieldToEventLoop();
  }

  if (isCancelled()) {
    throw new HashCancelledError();
  }

  onProgress?.(1);
  return hashers.map(({ algorithm, hasher }) => ({ algorithm, hash: hasher.digest('hex') }));
}
