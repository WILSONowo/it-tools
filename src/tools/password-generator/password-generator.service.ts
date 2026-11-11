import { secureRandomInt, shuffleArrayMutate } from '@/utils/random';

export const CHARSETS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  number: '0123456789',
  symbol: '!@#$%^&*()-_=+[]{};:,.<>?/~',
} as const;

export type CharsetName = keyof typeof CHARSETS;

/** Upper bound on generated characters per click, so the tab never freezes. */
export const MAX_TOTAL_CHARS = 5_000_000;

export interface GeneratorOptions {
  charsets: CharsetName[];
  /** Characters that must appear in every result (and are added to the pool). */
  include?: string;
  /** Characters that must never appear. Wins over `include`. */
  exclude?: string;
  length: number;
  /** Optional upper bound: each result's length is random in [length, lengthMax]. */
  lengthMax?: number | null;
  count: number;
}

export interface GeneratorPlan {
  /** Every allowed character, deduplicated. */
  pool: string[];
  /** Groups that must each contribute at least one character. */
  required: string[][];
}

function uniqueChars(value: string): string[] {
  return [...new Set([...value])];
}

export function planGenerator({ charsets, include = '', exclude = '' }: GeneratorOptions): GeneratorPlan {
  const excluded = new Set([...exclude]);
  const allowed = (chars: string) => uniqueChars(chars).filter((char) => !excluded.has(char));

  const classGroups = charsets.map((name) => allowed(CHARSETS[name])).filter((group) => group.length > 0);
  // Each "include" character is its own required group, so all of them appear.
  const includeGroups = allowed(include).map((char) => [char]);

  const pool = uniqueChars([...classGroups.flat(), ...includeGroups.flat()].join(''));
  return { pool, required: [...includeGroups, ...classGroups] };
}

/**
 * One random string: one character from every required group (when the length allows),
 * the rest from the whole pool, then a secure shuffle.
 */
export function generateOne(plan: GeneratorPlan, length: number): string {
  if (plan.pool.length === 0 || length <= 0) return '';
  const chars: string[] = [];
  for (const group of plan.required.slice(0, length)) {
    chars.push(group[secureRandomInt(group.length)]);
  }
  while (chars.length < length) {
    chars.push(plan.pool[secureRandomInt(plan.pool.length)]);
  }
  return shuffleArrayMutate(chars).join('');
}

export interface GeneratorResult {
  values: string[];
  /** Set when the request cannot be fully honoured; shown to the user. */
  warning?: string;
}

export function generateBatch(options: GeneratorOptions): GeneratorResult {
  const plan = planGenerator(options);
  if (plan.pool.length === 0) {
    return { values: [], warning: '没有可用字符:请至少选择一种字符,或减少排除字符' };
  }

  const minLength = Math.max(1, Math.floor(options.length || 0));
  const maxLength = options.lengthMax && options.lengthMax >= minLength ? Math.floor(options.lengthMax) : minLength;
  const count = Math.max(1, Math.floor(options.count || 0));

  if (count * maxLength > MAX_TOTAL_CHARS) {
    return {
      values: [],
      warning: `生成量过大(数量 × 长度超过 ${MAX_TOTAL_CHARS.toLocaleString()} 个字符),请减少数量或长度`,
    };
  }

  const seen = new Set<string>();
  const values: string[] = [];
  // Short lengths over small pools can run out of unique values: stop after enough misses.
  let misses = 0;
  const maxMisses = count * 20 + 1000;
  while (values.length < count && misses < maxMisses) {
    const length = minLength + secureRandomInt(maxLength - minLength + 1);
    const value = generateOne(plan, length);
    if (seen.has(value)) {
      misses++;
      continue;
    }
    seen.add(value);
    values.push(value);
  }

  const warnings: string[] = [];
  if (plan.required.length > minLength) {
    warnings.push(`长度小于必须包含的字符种类数(${plan.required.length}),部分字符类型可能不会出现`);
  }
  if (values.length < count) {
    warnings.push(`可组合的不重复结果不足,仅生成了 ${values.length} 个`);
  }
  return { values, warning: warnings.length > 0 ? warnings.join(';') : undefined };
}
