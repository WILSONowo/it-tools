import { describe, expect, it } from 'vitest';
import { decodeHtmlEntities, escapeHtmlEntities } from './html-entities.service';

describe('html-entities', () => {
  it('escapes special characters', () => {
    expect(escapeHtmlEntities('<a href="x">\'&\'</a>')).toBe('&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
  });

  it('decodes basic, named and numeric entities', () => {
    expect(decodeHtmlEntities('&lt;title&gt;IT &amp; Tools&lt;/title&gt;')).toBe('<title>IT & Tools</title>');
    expect(decodeHtmlEntities('a&nbsp;b')).toBe(`a${String.fromCharCode(0xa0)}b`);
    expect(decodeHtmlEntities('&copy; 2024')).toBe(`${String.fromCharCode(0xa9)} 2024`);
    expect(decodeHtmlEntities('&#20013;&#x6587;&#X4E2D;')).toBe('中文中');
    expect(decodeHtmlEntities('&#128512;')).toBe(String.fromCodePoint(0x1f600));
    expect(decodeHtmlEntities('&#39;&quot;')).toBe('\'"');
  });

  it('keeps unknown entities and real markup untouched', () => {
    expect(decodeHtmlEntities('&unknownentity; <b>bold</b> & co')).toBe('&unknownentity; <b>bold</b> & co');
    expect(decodeHtmlEntities('&#0;&#x110000;')).toBe(String.fromCharCode(0xfffd).repeat(2));
  });

  it('round-trips escaped text', () => {
    const text = '<script>alert("x")</script> & \'quotes\'';
    expect(decodeHtmlEntities(escapeHtmlEntities(text))).toBe(text);
  });
});
