import { get, type MaybeRef } from '@vueuse/core';
import JSON5 from 'json5';

export { sortObjectKeys, formatJson };

function sortObjectKeys(obj: unknown): unknown {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }

  return Object.keys(obj)
    .sort()
    .reduce((sortedObj, key) => {
      sortedObj[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
      return sortedObj;
    }, {} as Record<string, unknown>);
}

function formatJson({
  rawJson,
  sortKeys = true,
  indentSize = 3,
}: {
  rawJson: MaybeRef<string>;
  sortKeys?: MaybeRef<boolean>;
  indentSize?: MaybeRef<number>;
}) {
  const parsedObject = JSON5.parse(get(rawJson));

  return JSON.stringify(get(sortKeys) ? sortObjectKeys(parsedObject) : parsedObject, null, get(indentSize));
}

export interface LossyJsonValues {
  /** Integer literals beyond Number.MAX_SAFE_INTEGER, which lose precision when parsed */
  unsafeIntegers: string[];
  /** NaN / Infinity literals and numbers overflowing to Infinity, which JSON.stringify turns into null */
  nonFinite: string[];
}

const NUMBER_TOKEN = /[+-]?(?:0x[0-9a-f]+|(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)/iy;
const IDENTIFIER_TOKEN = /[+-]?[A-Za-z_$][\w$]*/y;
const MAX_SAFE = BigInt(Number.MAX_SAFE_INTEGER);

function isUnsafeInteger(token: string): boolean {
  const unsigned = token.replace(/^[+-]/, '');
  if (/^0x/i.test(unsigned)) return BigInt(unsigned) > MAX_SAFE;
  if (/^\d+$/.test(unsigned)) return BigInt(unsigned) > MAX_SAFE;
  return false;
}

/**
 * Pre-scan JSON / JSON5 source for number tokens that do not survive a parse + JSON.stringify round trip.
 * Strings and comments are skipped; object keys (identifiers followed by `:`) are ignored.
 */
export function findLossyJsonValues(source: string): LossyJsonValues {
  const result: LossyJsonValues = { unsafeIntegers: [], nonFinite: [] };
  let i = 0;

  const followedByColon = (from: number) => /^\s*:/.test(source.slice(from, from + 64));

  while (i < source.length) {
    const char = source[i];
    const next = source[i + 1];

    if (char === '"' || char === "'") {
      i++;
      while (i < source.length && source[i] !== char) i += source[i] === '\\' ? 2 : 1;
      i++;
      continue;
    }
    if (char === '/' && next === '/') {
      const end = source.indexOf('\n', i);
      i = end === -1 ? source.length : end;
      continue;
    }
    if (char === '/' && next === '*') {
      const end = source.indexOf('*/', i + 2);
      i = end === -1 ? source.length : end + 2;
      continue;
    }

    if (/[A-Za-z_$+-]/.test(char)) {
      IDENTIFIER_TOKEN.lastIndex = i;
      const identifier = IDENTIFIER_TOKEN.exec(source);
      if (identifier) {
        const name = identifier[0].replace(/^[+-]/, '');
        if ((name === 'NaN' || name === 'Infinity') && !followedByColon(IDENTIFIER_TOKEN.lastIndex)) {
          result.nonFinite.push(identifier[0]);
        }
        i = IDENTIFIER_TOKEN.lastIndex;
        continue;
      }
    }

    if (/[\d.+-]/.test(char)) {
      NUMBER_TOKEN.lastIndex = i;
      const number = NUMBER_TOKEN.exec(source);
      if (number) {
        const token = number[0];
        if (isUnsafeInteger(token)) result.unsafeIntegers.push(token);
        else if (!/^[+-]?0x/i.test(token) && !Number.isFinite(Number(token))) result.nonFinite.push(token);
        i = NUMBER_TOKEN.lastIndex;
        continue;
      }
    }

    i++;
  }

  return result;
}

/** User facing warning for values that are silently altered by parsing, or an empty string. */
export function getLossyJsonWarning(source: string): string {
  const { unsafeIntegers, nonFinite } = findLossyJsonValues(source);
  const sample = (values: string[]) => values.slice(0, 3).join('、') + (values.length > 3 ? ' 等' : '');
  const warnings: string[] = [];
  if (unsafeIntegers.length) {
    warnings.push(`检测到超出安全整数范围(±2^53-1)的数字 ${sample(unsafeIntegers)},解析后会丢失精度。`);
  }
  if (nonFinite.length) {
    warnings.push(`检测到 ${sample(nonFinite)},标准 JSON 不支持 NaN/Infinity,输出中会变为 null。`);
  }
  return warnings.join(' ');
}
