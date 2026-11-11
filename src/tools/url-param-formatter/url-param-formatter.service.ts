/** Extract the query part of a URL (or a bare query string), without the leading `?` and the `#fragment`. */
export function extractQuery(raw: string): string {
  let query = raw.trim();
  const hashIndex = query.indexOf('#');
  if (hashIndex >= 0) {
    query = query.slice(0, hashIndex);
  }
  const questionIndex = query.indexOf('?');
  if (questionIndex >= 0) {
    return query.slice(questionIndex + 1);
  }
  // A full URL without `?` has no query at all; otherwise treat the input as a bare query string
  return /^[a-z][a-z\d+.-]*:\/\//i.test(query) ? '' : query;
}

/** Decode a query component (`+` means a space in application/x-www-form-urlencoded). Throws on malformed `%` sequences. */
function decodeQueryComponent(value: string) {
  return decodeURIComponent(value.replace(/\+/g, ' '));
}

export function parsePairs(raw: string): [string, string][] {
  const query = extractQuery(raw);
  if (!query) {
    return [];
  }
  return query
    .split('&')
    .filter(Boolean)
    .map((pair) => {
      const eq = pair.indexOf('=');
      if (eq < 0) {
        return [decodeQueryComponent(pair), ''];
      }
      return [decodeQueryComponent(pair.slice(0, eq)), decodeQueryComponent(pair.slice(eq + 1))];
    });
}

export function pairsToLines(pairs: [string, string][]) {
  return pairs.map(([k, v]) => `${k} = ${v}`).join('\n');
}

/** Group pairs into a JSON object; repeated keys become arrays. Safe for keys like `toString` or `__proto__`. */
export function pairsToJson(pairs: [string, string][]) {
  const grouped = new Map<string, string[]>();
  for (const [k, v] of pairs) {
    grouped.set(k, [...(grouped.get(k) ?? []), v]);
  }
  const obj: Record<string, string | string[]> = Object.create(null);
  for (const [k, values] of grouped) {
    obj[k] = values.length === 1 ? values[0] : values;
  }
  return JSON.stringify(obj, null, 2);
}

export function buildQuery(lines: string, encode: boolean) {
  const pairs = lines
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const eq = line.indexOf('=');
      const k = (eq < 0 ? line : line.slice(0, eq)).trim();
      const v = (eq < 0 ? '' : line.slice(eq + 1)).trim();
      return encode ? `${encodeURIComponent(k)}=${encodeURIComponent(v)}` : `${k}=${v}`;
    });
  return `?${pairs.join('&')}`;
}
