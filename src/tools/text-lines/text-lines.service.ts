export function splitLines(input: string): string[] {
  return input.split(/\r\n|\r|\n/);
}

export function joinLines(lines: string[], separator = '\n'): string {
  return lines.join(separator);
}

export function removeBlankLines(lines: string[]): string[] {
  return lines.filter((line) => line.trim().length > 0);
}

export function deduplicateLines(lines: string[]): string[] {
  return [...new Set(lines)];
}

export function deduplicateConsecutiveLines(lines: string[]): string[] {
  return lines.filter((line, index) => index === 0 || line !== lines[index - 1]);
}

export function trimLines(lines: string[]): string[] {
  return lines.map((line) => line.trim());
}

export function trimLinesEnd(lines: string[]): string[] {
  return lines.map((line) => line.replace(/\s+$/, ''));
}

export function addLineNumbers(
  lines: string[],
  {
    start = 1,
    step = 1,
    padding = 0,
    after = false,
    separator = ': ',
  }: {
    start?: number;
    step?: number;
    padding?: number;
    after?: boolean;
    separator?: string;
  } = {},
): string[] {
  return lines.map((line, index) => {
    const number = String(start + index * step);
    const formattedNumber = padding > 0 ? number.padStart(padding, ' ') : number;

    return after ? `${line}${separator}${formattedNumber}` : `${formattedNumber}${separator}${line}`;
  });
}

export function removeLineNumbers(lines: string[], pattern: RegExp): string[] {
  return lines.map((line) => line.replace(pattern, ''));
}

export function filterLinesByRegex(lines: string[], pattern: RegExp, invert = false): string[] {
  return lines.filter((line) => (invert ? !pattern.test(line) : pattern.test(line)));
}

export function filterLinesBySubstring(lines: string[], substring: string, invert = false): string[] {
  const needle = substring.toLowerCase();

  return lines.filter((line) => (invert ? !line.toLowerCase().includes(needle) : line.toLowerCase().includes(needle)));
}

export function wrapLines(lines: string[], prefix: string, suffix: string): string[] {
  return lines.map((line) => `${prefix}${line}${suffix}`);
}
