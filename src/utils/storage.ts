import type { Serializer } from '@vueuse/core';

/**
 * JSON serializer for useStorage that never yields an invalid value.
 *
 * vueuse's default reader assigns `undefined` when parsing fails, so a corrupted
 * localStorage entry (e.g. `"null"` or a truncated `"{"`) used to crash the whole
 * layout. Here any unparsable or wrongly-shaped value falls back to a fresh default.
 */
export function safeJsonSerializer<T>(fallback: () => T, isValid: (value: unknown) => value is T): Serializer<T> {
  return {
    read: (raw: string) => {
      try {
        const value: unknown = JSON.parse(raw);
        return isValid(value) ? value : fallback();
      } catch {
        return fallback();
      }
    },
    write: (value: T) => JSON.stringify(value),
  };
}

export const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

export const isBooleanRecord = (value: unknown): value is Record<string, boolean> =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  Object.values(value).every((item) => typeof item === 'boolean');
