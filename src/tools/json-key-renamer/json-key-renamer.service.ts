export type CaseMode =
  | 'camelCase'
  | 'snakeCase'
  | 'kebabCase'
  | 'pascalCase'
  | 'constantCase'
  | 'upperCase'
  | 'lowerCase';

const capitalize = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);

function splitWords(key: string): string[] {
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/[_\-\s.]+/g, ' ')
    .trim()
    .toLowerCase()
    .split(' ')
    .filter(Boolean);
}

export function convertCase(key: string, mode: CaseMode | string | null | undefined): string {
  const words = splitWords(key);
  if (words.length === 0) return key;

  switch (mode) {
    case 'camelCase':
      return words.map((w, i) => (i === 0 ? w : capitalize(w))).join('');
    case 'snakeCase':
      return words.join('_');
    case 'kebabCase':
      return words.join('-');
    case 'pascalCase':
      return words.map(capitalize).join('');
    case 'constantCase':
      return words.join('_').toUpperCase();
    case 'upperCase':
      return key.toUpperCase();
    case 'lowerCase':
      return key.toLowerCase();
    default:
      return key;
  }
}

/** Parse `old => new` lines into a map. */
export function parseKeyMap(text: string): Record<string, string> {
  const result: Record<string, string> = Object.create(null);
  for (const line of text.split('\n')) {
    const parts = line.split('=>');
    if (parts.length === 2 && parts[0].trim() !== '') result[parts[0].trim()] = parts[1].trim();
  }
  return result;
}

// Plain assignment would treat a "__proto__" key as the prototype setter.
function setOwn(target: Record<string, unknown>, key: string, value: unknown) {
  Object.defineProperty(target, key, { value, enumerable: true, writable: true, configurable: true });
}

function isPlainObject(node: unknown): node is Record<string, unknown> {
  return node !== null && typeof node === 'object' && !Array.isArray(node);
}

/**
 * Rename keys recursively (including inside arrays). Keys present in `map` are renamed to the mapped name;
 * other keys get the optional case conversion.
 */
export function renameKeys(
  node: unknown,
  { map, caseMode }: { map: Record<string, string>; caseMode?: CaseMode | string | null },
): { value: unknown; changes: number } {
  let changes = 0;

  const walk = (current: unknown): unknown => {
    if (Array.isArray(current)) return current.map(walk);
    if (!isPlainObject(current)) return current;

    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(current)) {
      const newKey = Object.prototype.hasOwnProperty.call(map, key) ? map[key] : convertCase(key, caseMode);
      if (newKey !== key) changes++;
      setOwn(result, newKey, walk(value));
    }
    return result;
  };

  return { value: walk(node), changes };
}

/** Keep keys, but replace primitive values that appear in `map` (`oldValue => newValue`). */
export function overrideValues(node: unknown, map: Record<string, string>): { value: unknown; changes: number } {
  let changes = 0;

  const walk = (current: unknown): unknown => {
    if (Array.isArray(current)) return current.map(walk);
    if (isPlainObject(current)) {
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(current)) setOwn(result, key, walk(value));
      return result;
    }
    if (current !== null && Object.prototype.hasOwnProperty.call(map, String(current))) {
      changes++;
      return map[String(current)];
    }
    return current;
  };

  return { value: walk(node), changes };
}
