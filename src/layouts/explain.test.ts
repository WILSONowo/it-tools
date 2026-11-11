import { describe, expect, it } from 'vitest';
import { parseExplain, renderExplainText } from './explain';

describe('parseExplain', () => {
  it('parses headings, list items and paragraphs', () => {
    expect(parseExplain(['## 标题', '- 第一项', '普通段落'])).toEqual([
      { type: 'heading', text: '标题' },
      { type: 'li', text: '第一项' },
      { type: 'p', text: '普通段落' },
    ]);
  });

  it('skips Markdown separator rows in tables', () => {
    expect(parseExplain(['| 格式 | 说明 |', '| --- | :-: |', '| MP3 | 有损 |', '之后'])).toEqual([
      {
        type: 'table',
        rows: [
          ['格式', '说明'],
          ['MP3', '有损'],
        ],
      },
      { type: 'p', text: '之后' },
    ]);
  });

  it('keeps cells that merely contain dashes', () => {
    expect(parseExplain(['| a | b |', '| -1 | x-y |'])).toEqual([
      {
        type: 'table',
        rows: [
          ['a', 'b'],
          ['-1', 'x-y'],
        ],
      },
    ]);
  });
});

describe('renderExplainText', () => {
  it('escapes HTML and renders bold', () => {
    expect(renderExplainText('**注意** <script>alert(1)</script> & "x"')).toBe(
      '<b>注意</b> &lt;script&gt;alert(1)&lt;/script&gt; &amp; &quot;x&quot;',
    );
  });
});
