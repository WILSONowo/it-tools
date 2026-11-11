import { random, randIntFromInterval, randomUuid } from '@/utils/random';

export type JsonFieldType = 'string' | 'number' | 'boolean' | 'date' | 'email' | 'uuid' | 'null';

export interface RandomJsonOptions {
  rootType: 'object' | 'array';
  fieldCount: number;
  arrayLength: number;
  /** Maximum object nesting depth: 1 = flat objects, 2 = objects containing one level of nested objects, ... */
  depth: number;
  fieldTypes: string[];
}

export { randomUuid };

function pick<T>(items: T[]): T {
  return items[randIntFromInterval(0, items.length - 1)];
}

function randomString(): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  const length = randIntFromInterval(4, 12);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += pick([...alphabet]);
  }

  return result;
}

export function randomPrimitive(type: string): unknown {
  switch (type) {
    case 'number':
      return randIntFromInterval(-9999, 99999);
    case 'boolean':
      return random() < 0.5;
    case 'date':
      return new Date(randIntFromInterval(0, Date.now())).toISOString();
    case 'email':
      return `${randomString()}@${randomString()}.com`;
    case 'uuid':
      return randomUuid();
    case 'null':
      return null;
    default:
      return randomString();
  }
}

function randomObject(level: number, options: RandomJsonOptions, types: string[]): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  const count = Math.max(1, Math.floor(options.fieldCount));
  // Until the maximum depth is reached, one field of every object is a nested object
  // (or an array of 1-2 nested objects), so the depth setting is always visible.
  const nestedIndex = level < options.depth ? randIntFromInterval(0, count - 1) : -1;

  for (let i = 0; i < count; i++) {
    const key = `field${i + 1}_${randomString().slice(0, 3)}`;
    if (i === nestedIndex) {
      obj[key] =
        random() < 0.5
          ? randomObject(level + 1, options, types)
          : Array.from({ length: randIntFromInterval(1, 2) }, () => randomObject(level + 1, options, types));
    } else {
      obj[key] = randomPrimitive(pick(types));
    }
  }

  return obj;
}

export function generateRandomJson(options: RandomJsonOptions): Record<string, unknown> | Record<string, unknown>[] {
  const types = options.fieldTypes.length > 0 ? options.fieldTypes : ['string'];
  const depth = Math.max(1, Math.floor(options.depth));
  const normalized = { ...options, depth };

  if (options.rootType === 'array') {
    return Array.from({ length: Math.max(1, Math.floor(options.arrayLength)) }, () =>
      randomObject(1, normalized, types),
    );
  }

  return randomObject(1, normalized, types);
}
