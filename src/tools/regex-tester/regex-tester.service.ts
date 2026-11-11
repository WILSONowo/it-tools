/**
 * Convert the tool's extra replacement syntax into native `String.prototype.replace` syntax:
 * - `\1`      → `$1`      (backreference style)
 * - `${name}` → `$<name>` (named group)
 * - `\$`      → `$$`      (literal dollar sign)
 * Native tokens such as `$1`, `$<name>`, `$&`, `` $` `` and `$'` pass through unchanged.
 */
export function toNativeReplacement(replacement: string): string {
  return replacement.replace(/\\\$|\\(\d+)|\$\{([^}]+)\}/g, (token, num?: string, name?: string) => {
    if (num !== undefined) return `$${num}`;
    if (name !== undefined) return `$<${name}>`;
    return '$$';
  });
}

/**
 * Apply a replacement with native semantics. Delegating to `String.prototype.replace`
 * means a non-global regex replaces only the first match instead of looping forever.
 */
export function replaceWithRegex(source: string, regex: RegExp, replacement: string): string {
  regex.lastIndex = 0;
  return source.replace(regex, toNativeReplacement(replacement));
}

export interface RegexMatch {
  match: string;
  index: number;
  groups?: Record<string, string | undefined>;
}

export interface RegexRunRequest {
  pattern: string;
  flags: string;
  text: string;
  replacement: string;
}

export interface RegexRunResult {
  error: string;
  matches: RegexMatch[];
  replaced: string;
}

/**
 * Compile the pattern once, collect the matches and compute the replacement.
 * Runs inside a Web Worker so that catastrophic backtracking cannot freeze the page.
 */
export function runRegex({ pattern, flags, text, replacement }: RegexRunRequest): RegexRunResult {
  let regex: RegExp;
  try {
    regex = new RegExp(pattern, flags);
  } catch (e) {
    return { error: (e as Error).message, matches: [], replaced: '' };
  }

  if (text === '') return { error: '', matches: [], replaced: '' };

  const toMatch = (m: RegExpExecArray): RegexMatch => ({
    match: m[0],
    index: m.index,
    groups: m.groups ? { ...m.groups } : undefined,
  });

  const matches: RegexMatch[] = [];
  regex.lastIndex = 0;
  if (regex.global) {
    let m: RegExpExecArray | null;
    while ((m = regex.exec(text)) !== null) {
      matches.push(toMatch(m));
      if (m[0] === '') regex.lastIndex++;
    }
  } else {
    const m = regex.exec(text);
    if (m) matches.push(toMatch(m));
  }

  const replaced = replacement === '' ? '' : replaceWithRegex(text, regex, replacement);

  return { error: '', matches, replaced };
}
