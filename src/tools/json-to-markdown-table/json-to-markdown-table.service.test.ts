import { describe, expect, it } from 'vitest';
import {
  jsonToMarkdownTable,
  markdownTableToJson,
  parseMarkdownTable,
  splitRow,
} from './json-to-markdown-table.service';

describe('json-to-markdown-table', () => {
  it('converts JSON to a markdown table', () => {
    expect(jsonToMarkdownTable('[{"a":1,"b":"x"},{"a":2}]')).toBe('| a | b |\n| --- | --- |\n| 1 | x |\n| 2 |  |');
  });

  it('escapes pipes in header keys and values', () => {
    expect(jsonToMarkdownTable('[{"a|b":"c|d"}]')).toBe('| a\\|b |\n| --- |\n| c\\|d |');
  });

  it('does not treat the separator row as data', () => {
    const p = parseMarkdownTable('| name | category |\n| :--- | ---: |\n| it-tools | dev |');
    expect(p).toEqual({ ok: true, columns: ['name', 'category'], rows: [['it-tools', 'dev']] });
  });

  it('splits on unescaped pipes only', () => {
    expect(splitRow('| a\\|b | c |')).toEqual(['a|b', 'c']);
    expect(splitRow('| x | y\\| |')).toEqual(['x', 'y|']);
  });

  it('reports rows with mismatching column counts', () => {
    expect(parseMarkdownTable('| a | b |\n| --- | --- |\n| 1 |').ok).toBe(false);
  });

  it('round-trips its own output', () => {
    const data = [
      { 'na|me': 'it|tools', note: 'line1\nline2', empty: '' },
      { 'na|me': 'other', note: 'x', empty: 'y' },
    ];
    const md = jsonToMarkdownTable(JSON.stringify(data));
    expect(JSON.parse(markdownTableToJson(md))).toEqual(data);
  });

  it('handles keys like toString safely', () => {
    const json = JSON.parse(markdownTableToJson('| __proto__ | toString |\n| --- | --- |\n| 1 | 2 |'));
    expect(json[0].toString).toBe('2');
  });
});
