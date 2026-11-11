import { describe, expect, it } from 'vitest';
import { jsStringToText, textToJsString } from './html-js-converter.service';

const tricky = '<div class="a" data-x=\'y\'>\n  `code` \\ ${notInterpolated} $ {}\r\n  中文 \u2028</div>';

describe('html-js-converter', () => {
  describe('textToJsString', () => {
    it('escapes for double and single quotes', () => {
      expect(textToJsString('a"b\'c\nd\\e', 'double')).toBe('"a\\"b\'c\\nd\\\\e"');
      expect(textToJsString('a"b\'c\nd\\e', 'single')).toBe("'a\"b\\'c\\nd\\\\e'");
    });

    it('escapes backticks, backslashes and ${ in template mode', () => {
      expect(textToJsString('a`b\\c${d}e$f', 'template')).toBe('`a\\`b\\\\c\\${d}e$f`');
      expect(textToJsString('line1\nline2', 'template')).toBe('`line1\nline2`');
    });

    it('produces valid literals that round-trip', () => {
      for (const quote of ['double', 'single', 'template'] as const) {
        const literal = textToJsString(tricky, quote);
        const expected = tricky.replace(/\r\n/g, '\n');
        expect(jsStringToText(literal)).toBe(expected);
        // eslint-disable-next-line no-new-func
        expect(new Function(`return ${literal};`)()).toBe(expected);
      }
    });
  });

  describe('jsStringToText', () => {
    it('parses single, double and template literals', () => {
      expect(jsStringToText("'a\\'b'")).toBe("a'b");
      expect(jsStringToText('"a\\"b\\n"')).toBe('a"b\n');
      expect(jsStringToText('`multi\nline \\${x}`')).toBe('multi\nline ${x}');
    });

    it('handles concatenation, comments, declarations and semicolons', () => {
      expect(jsStringToText('\'<div>\' +\n  "hello" + // comment\n  `</div>`;')).toBe('<div>hello</div>');
      expect(jsStringToText("const html = 'a' /* x */ + 'b';")).toBe('ab');
    });

    it('decodes escapes', () => {
      expect(jsStringToText('"\\x41\\u4e2d\\u{1F600}\\t\\0"')).toBe('A中😀\t\0');
      expect(jsStringToText('"a\\\nb"')).toBe('ab');
    });

    it('never evaluates code', () => {
      expect(() => jsStringToText('alert(1)')).toThrow();
      expect(() => jsStringToText('"a" + window.x')).toThrow();
      expect(() => jsStringToText('`${alert(1)}`')).toThrow();
      expect(() => jsStringToText('"a"; alert(1)')).toThrow();
    });

    it('reports malformed input', () => {
      expect(() => jsStringToText('"unterminated')).toThrow();
      expect(() => jsStringToText('"a" +')).toThrow();
      expect(() => jsStringToText('"line\nbreak"')).toThrow();
      expect(() => jsStringToText('"\\u12"')).toThrow();
      expect(jsStringToText('   ')).toBe('');
    });
  });
});
