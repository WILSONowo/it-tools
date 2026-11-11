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
