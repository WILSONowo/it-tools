// Parser for a tool's `explain` lines (shown in the "说明" panel of the tool layout).
// Supported syntax: "## heading", "- list item", "| a | b |" table rows (the first row is the
// header; a Markdown separator row like "| --- | :-: |" is skipped), and **bold** in text.

export type ExplainItem =
  | { type: 'table'; rows: string[][] }
  | { type: 'heading'; text: string }
  | { type: 'li'; text: string }
  | { type: 'p'; text: string };

const TABLE_SEPARATOR_ROW = /^\|(\s*:?-+:?\s*\|)+\s*$/;

function splitRow(line: string): string[] {
  const trimmed = line.trim();
  const inner = trimmed.endsWith('|') ? trimmed.slice(1, -1) : trimmed.slice(1);
  return inner.split('|').map((cell) => cell.trim());
}

export function parseExplain(lines: string[]): ExplainItem[] {
  const items: ExplainItem[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith('|')) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        if (!TABLE_SEPARATOR_ROW.test(lines[i].trim())) {
          rows.push(splitRow(lines[i]));
        }
        i++;
      }
      items.push({ type: 'table', rows });
    } else if (line.startsWith('## ')) {
      items.push({ type: 'heading', text: line.slice(3) });
      i++;
    } else if (line.startsWith('- ')) {
      items.push({ type: 'li', text: line.slice(2) });
      i++;
    } else {
      items.push({ type: 'p', text: line });
      i++;
    }
  }
  return items;
}

/** Escape HTML, then turn **bold** into <b>. The result is safe for v-html. */
export function renderExplainText(text: string): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  return escaped.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
}
