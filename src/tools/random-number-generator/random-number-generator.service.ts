import { randIntFromInterval } from '@/utils/random';

export interface RandomNumberOptions {
  type: 'int' | 'float';
  /** Number of decimals for floats */
  decimals: number;
  /** Inclusive lower bound */
  min: number;
  /** Exclusive upper bound */
  max: number;
  count: number;
  unique: boolean;
}

export type RandomNumberResult = { ok: true; values: string[] } | { ok: false; error: string };

/** ceil(x) that tolerates floating point noise such as 0.1 * 1000 = 100.00000000000001 */
function ceilTolerant(x: number): number {
  const rounded = Math.round(x);
  return Math.abs(x - rounded) < 1e-9 * Math.max(1, Math.abs(x)) ? rounded : Math.ceil(x);
}

/**
 * Generate random numbers in [min, max). Floats are drawn on the grid of `decimals` decimals,
 * so a value rounded to the requested precision can never reach the excluded max.
 */
export function generateRandomNumbers({
  type,
  decimals,
  min,
  max,
  count,
  unique,
}: RandomNumberOptions): RandomNumberResult {
  if (![min, max, count].every((n) => typeof n === 'number' && Number.isFinite(n))) {
    return { ok: false, error: '请填写最小值、最大值和生成数量' };
  }
  if (min >= max) return { ok: false, error: '最小值必须小于最大值' };

  const digits = type === 'float' ? Math.min(20, Math.max(0, Math.floor(decimals ?? 0))) : 0;
  const factor = 10 ** digits;
  // Integer grid k such that min <= k / factor < max
  const low = ceilTolerant(min * factor);
  const high = ceilTolerant(max * factor) - 1;
  const possible = high - low + 1;
  const wanted = Math.max(0, Math.floor(count));

  if (possible <= 0) {
    return { ok: false, error: `[${min}, ${max}) 内没有可用的${digits ? ` ${digits} 位小数` : '整数'}` };
  }
  if (unique && wanted > possible) {
    return {
      ok: false,
      error: `该范围内只有 ${possible} 个不同的值,无法生成 ${wanted} 个不重复的数`,
    };
  }

  const format = (k: number) => (digits === 0 ? String(k) : (k / factor).toFixed(digits));

  if (!Number.isSafeInteger(low) || !Number.isSafeInteger(high) || !Number.isSafeInteger(possible)) {
    // Grid too fine to enumerate exactly (e.g. 20 decimals): draw continuously and re-draw values that round onto max.
    const values: string[] = [];
    const seen = new Set<string>();
    let guard = 0;
    while (values.length < wanted && guard++ < wanted * 100 + 100) {
      const value = (Math.random() * (max - min) + min).toFixed(digits);
      if (Number(value) >= max || Number(value) < min) continue;
      if (unique && seen.has(value)) continue;
      seen.add(value);
      values.push(value);
    }
    return { ok: true, values };
  }

  if (!unique) {
    return { ok: true, values: Array.from({ length: wanted }, () => format(randIntFromInterval(low, high))) };
  }

  // Sparse partial Fisher-Yates over [0, possible): unique values without enumerating the range.
  const swapped = new Map<number, number>();
  const values: string[] = [];
  for (let i = 0; i < wanted; i++) {
    const j = randIntFromInterval(i, possible - 1);
    const picked = swapped.get(j) ?? j;
    swapped.set(j, swapped.get(i) ?? i);
    values.push(format(low + picked));
  }
  return { ok: true, values };
}
