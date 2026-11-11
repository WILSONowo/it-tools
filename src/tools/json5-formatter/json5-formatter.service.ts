const typeLabelMap: Record<string, string> = {
  null: '空值 (null)',
  array: '数组',
  object: '对象',
  string: '字符串',
  number: '数字',
  boolean: '布尔值',
  undefined: '未定义',
};

export function getJson5TypeLabel(value: unknown) {
  const type = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
  return typeLabelMap[type] ?? type;
}

/**
 * List the paths (e.g. `$.a.b[0]`) of Infinity / -Infinity / NaN values.
 * JSON5 allows them but JSON.stringify turns them into null.
 */
export function findNonFiniteNumbers(value: unknown, path = '$'): string[] {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? [] : [`${path} (${value})`];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => findNonFiniteNumbers(item, `${path}[${index}]`));
  }
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, item]) =>
      findNonFiniteNumbers(item, /^[A-Za-z_$][\w$]*$/.test(key) ? `${path}.${key}` : `${path}[${JSON.stringify(key)}]`),
    );
  }
  return [];
}
