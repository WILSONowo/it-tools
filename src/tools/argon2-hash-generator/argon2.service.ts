import { argon2Verify, argon2id } from 'hash-wasm';

export const ARGON2_PARALLELISM = 1;
export const ARGON2_MAX_MEMORY_KIB = 1024 * 1024; // 1 GiB,再大浏览器标签页很可能内存不足

export function getArgon2ParamsError({
  iterations,
  memorySize,
  hashLength,
}: {
  iterations: number | null | undefined;
  memorySize: number | null | undefined;
  hashLength: number | null | undefined;
}): string | undefined {
  if (!Number.isInteger(iterations) || (iterations as number) < 1) {
    return '迭代次数必须是大于等于 1 的整数';
  }
  if (!Number.isInteger(memorySize) || (memorySize as number) < 8 * ARGON2_PARALLELISM) {
    return `内存大小必须是大于等于 ${8 * ARGON2_PARALLELISM} 的整数(单位 KiB)`;
  }
  if ((memorySize as number) > ARGON2_MAX_MEMORY_KIB) {
    return `内存大小不能超过 ${ARGON2_MAX_MEMORY_KIB} KiB(1 GiB)`;
  }
  if (!Number.isInteger(hashLength) || (hashLength as number) < 4) {
    return '哈希长度必须是大于等于 4 的整数(字节)';
  }
  return undefined;
}

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function argon2Hash({
  password,
  iterations,
  memorySize,
  hashLength,
  salt = crypto.getRandomValues(new Uint8Array(16)),
}: {
  password: string;
  iterations: number | null | undefined;
  memorySize: number | null | undefined;
  hashLength: number | null | undefined;
  salt?: Uint8Array;
}): Promise<{ hash: string; error?: undefined } | { hash: ''; error: string }> {
  const paramsError = getArgon2ParamsError({ iterations, memorySize, hashLength });
  if (paramsError) {
    return { hash: '', error: paramsError };
  }

  try {
    const hash = await argon2id({
      password,
      salt,
      parallelism: ARGON2_PARALLELISM,
      iterations: iterations as number,
      memorySize: memorySize as number,
      hashLength: hashLength as number,
      outputType: 'encoded',
    });
    return { hash };
  } catch (error) {
    return { hash: '', error: `哈希计算失败:${toMessage(error)}` };
  }
}

export async function argon2Compare({
  password,
  hash,
}: {
  password: string;
  hash: string;
}): Promise<{ match: boolean; error?: string }> {
  const trimmed = hash.trim();
  if (trimmed === '') {
    return { match: false };
  }
  if (!/^\$argon2(id|i|d)\$/.test(trimmed)) {
    return { match: false, error: '哈希格式无效,应以 $argon2id$、$argon2i$ 或 $argon2d$ 开头' };
  }

  try {
    return { match: await argon2Verify({ password, hash: trimmed }) };
  } catch (error) {
    return { match: false, error: `哈希格式无效:${toMessage(error)}` };
  }
}
