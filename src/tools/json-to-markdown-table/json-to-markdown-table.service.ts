export type JsonParseResult =
  | { ok: true; rows: Record<string, unknown>[]; columns: string[] }
  | { ok: false; error: string };

export type MarkdownParseResult = { ok: true; rows: string[][]; columns: string[] } | { ok: false; error: string };

export function escapeCell(value: unknown): string {
  const str =
    value === null || value === undefined ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value);
  return str.replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}

function unescapeCell(cell: string): string {
  return cell
    .trim()
    .replace(/\\\|/g, '|')
    .replace(/<br\s*\/?>/gi, '\n');
}

export function parseJsonRows(input: string): JsonParseResult {
  try {
    const value = JSON.parse(input);
    if (Array.isArray(value) && value.length === 0) {
      return { ok: true, rows: [], columns: [] };
    }
    const rows = Array.isArray(value) ? value : [value];
    if (!rows.every((row) => row && typeof row === 'object' && !Array.isArray(row))) {
      return { ok: false, error: '输入必须是对象或对象数组。' };
    }
    const columns = [...new Set(rows.flatMap((row) => Object.keys(row as Record<string, unknown>)))];
    return { ok: true, rows: rows as Record<string, unknown>[], columns };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export function jsonToMarkdownTable(input: string): string {
  const p = parseJsonRows(input);
  if (!p.ok || p.rows.length === 0) {
    return '';
  }
  const header = `| ${p.columns.map(escapeCell).join(' | ')} |`;
  const separator = `| ${p.columns.map(() => '---').join(' | ')} |`;
  const body = p.rows.map((row) => `| ${p.columns.map((col) => escapeCell(row[col])).join(' | ')} |`).join('\n');

  return [header, separator, body].join('\n');
}

/**
 * Split a table row on pipes that are not escaped with a backslash, then unescape `\|`.
 * Implemented without a regex lookbehind so it also works on older Safari.
 */
export function splitRow(line: string): string[] {
  let content = line.trim();
  if (content.startsWith('|')) {
    content = content.slice(1);
  }
  if (content.endsWith('|') && !content.endsWith('\\|')) {
    content = content.slice(0, -1);
  }

  const cells: string[] = [];
  let current = '';
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (char === '\\' && content[i + 1] === '|') {
      current += '\\|';
      i++;
      continue;
    }
    if (char === '|') {
      cells.push(current);
      current = '';
      continue;
    }
    current += char;
  }
  cells.push(current);
  return cells.map(unescapeCell);
}

function isSeparatorRow(cells: string[]) {
  return cells.length > 0 && cells.every((cell) => /^:?-+:?$/.test(cell.replace(/\s/g, '')));
}

export function parseMarkdownTable(md: string): MarkdownParseResult {
  const lines = md
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith('|'));
  if (lines.length < 2) {
    return { ok: false, error: '至少需要表头行和分隔行。' };
  }
  const header = splitRow(lines[0]);
  const rows = lines
    .slice(1)
    .map(splitRow)
    .filter((row, index) => !(index === 0 && isSeparatorRow(row)));
  if (!rows.every((row) => row.length === header.length)) {
    return { ok: false, error: '所有行必须具有相同的列数。' };
  }

  return { ok: true, columns: header, rows };
}

export function markdownTableToJson(md: string): string {
  const p = parseMarkdownTable(md);
  if (!p.ok) {
    return '';
  }
  const data = p.rows.map((row) => {
    const obj: Record<string, string> = Object.create(null);
    p.columns.forEach((col, index) => {
      obj[col] = row[index] ?? '';
    });
    return obj;
  });

  return JSON.stringify(data, null, 2);
}
