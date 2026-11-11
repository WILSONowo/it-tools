import { describe, expect, it } from 'vitest';
import { generateRandomJson, randomUuid } from './random-json-data-generator.service';

function maxDepth(value: unknown): number {
  if (Array.isArray(value)) return Math.max(0, ...value.map(maxDepth));
  if (value !== null && typeof value === 'object') {
    return 1 + Math.max(0, ...Object.values(value).map(maxDepth));
  }
  return 0;
}

const base = { rootType: 'object' as const, fieldCount: 6, arrayLength: 3, fieldTypes: ['string', 'number'] };

describe('randomUuid', () => {
  it('generates RFC 4122 v4 UUIDs', () => {
    for (let i = 0; i < 20; i++) {
      expect(randomUuid()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    }
  });
});

describe('generateRandomJson', () => {
  it('respects the field count at every level', () => {
    const result = generateRandomJson({ ...base, depth: 3 }) as Record<string, unknown>;
    expect(Object.keys(result)).toHaveLength(6);
  });

  it('produces flat objects with depth 1', () => {
    expect(maxDepth(generateRandomJson({ ...base, depth: 1 }))).toBe(1);
  });

  it('nests objects up to the requested depth', () => {
    for (const depth of [2, 3, 4]) {
      expect(maxDepth(generateRandomJson({ ...base, depth }))).toBe(depth);
    }
  });

  it('generates an array of objects', () => {
    const result = generateRandomJson({ ...base, rootType: 'array', depth: 2 });
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(3);
  });

  it('falls back to strings when no field type is selected', () => {
    const result = generateRandomJson({ ...base, fieldTypes: [], depth: 1 }) as Record<string, unknown>;
    expect(Object.values(result).every((v) => typeof v === 'string')).toBe(true);
  });
});
