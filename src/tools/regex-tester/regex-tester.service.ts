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
