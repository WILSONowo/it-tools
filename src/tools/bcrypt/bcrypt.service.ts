import { compare, hash } from 'bcryptjs';

export const BCRYPT_MIN_COST = 4;
export const BCRYPT_MAX_COST = 31;
export const BCRYPT_DEFAULT_COST = 10;
export const BCRYPT_MAX_BYTES = 72;

/** 清空输入框时 n-input-number 会给出 null,这里统一回落到默认值并限制在 bcrypt 允许的 4~31 之间 */
export function normalizeCost(cost: number | null | undefined): number {
  if (cost === null || cost === undefined || !Number.isFinite(cost)) {
    return BCRYPT_DEFAULT_COST;
  }
  return Math.min(BCRYPT_MAX_COST, Math.max(BCRYPT_MIN_COST, Math.round(cost)));
}

export function utf8ByteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

/** bcrypt 只使用输入的前 72 个字节,超出部分会被忽略 */
export function isTruncatedByBcrypt(value: string): boolean {
  return utf8ByteLength(value) > BCRYPT_MAX_BYTES;
}

export function bcryptHash(
  value: string,
  cost: number | null | undefined,
  onProgress?: (percent: number) => void,
): Promise<string> {
  // bcryptjs 的异步版本会分片计算并让出事件循环,不会像 hashSync 那样卡住页面
  return new Promise((resolve, reject) => {
    hash(value, normalizeCost(cost), (err, result) => (err ? reject(err) : resolve(result)), onProgress);
  });
}

export async function bcryptCompare(value: string, hashed: string): Promise<boolean> {
  const trimmed = hashed.trim();
  if (!/^\$2[abxy]?\$\d{2}\$[./A-Za-z0-9]{53}$/.test(trimmed)) {
    return false;
  }
  return compare(value, trimmed);
}
