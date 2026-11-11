export type QuoteStyle = 'double' | 'single' | 'template';

// U+2028 / U+2029 (line / paragraph separators), escaped for readability in the output
const LINE_SEPARATORS = new RegExp(`[${String.fromCharCode(0x2028, 0x2029)}]`, 'g');

/** Turn arbitrary text into a JavaScript string literal. */
export function textToJsString(source: string, quote: QuoteStyle): string {
  let escaped = source.replace(/\\/g, '\\\\');

  if (quote === 'template') {
    // Template literals may span multiple lines; only `, \ and ${ need escaping
    escaped = escaped.replace(/`/g, '\\`').replace(/\$\{/g, '\\${').replace(/\r\n?/g, '\n');
    return `\`${escaped}\``;
  }

  const quoteChar = quote === 'single' ? "'" : '"';
  escaped = escaped
    .replace(quote === 'single' ? /'/g : /"/g, `\\${quoteChar}`)
    .replace(/\r\n|\r|\n/g, '\\n')
    .replace(LINE_SEPARATORS, (char) => `\\u${char.charCodeAt(0).toString(16)}`);
  return `${quoteChar}${escaped}${quoteChar}`;
}

const SIMPLE_ESCAPES: Record<string, string> = {
  n: '\n',
  t: '\t',
  r: '\r',
  b: '\b',
  f: '\f',
  v: '\v',
};

class Tokenizer {
  pos = 0;
  constructor(private readonly src: string) {}

  get done() {
    return this.pos >= this.src.length;
  }

  peek() {
    return this.src[this.pos];
  }

  skipWhitespaceAndComments() {
    while (!this.done) {
      const rest = this.src.slice(this.pos);
      const ws = rest.match(/^\s+/);
      if (ws) {
        this.pos += ws[0].length;
        continue;
      }
      if (rest.startsWith('//')) {
        const end = this.src.indexOf('\n', this.pos);
        this.pos = end === -1 ? this.src.length : end + 1;
        continue;
      }
      if (rest.startsWith('/*')) {
        const end = this.src.indexOf('*/', this.pos + 2);
        if (end === -1) {
          throw new Error('注释未闭合');
        }
        this.pos = end + 2;
        continue;
      }
      break;
    }
  }

  readStringLiteral(): string {
    const quote = this.src[this.pos];
    const isTemplate = quote === '`';
    const start = this.pos;
    this.pos++;
    let out = '';

    for (;;) {
      if (this.done) {
        throw new Error(`第 ${start + 1} 个字符处的字符串未闭合`);
      }
      const ch = this.src[this.pos];

      if (ch === quote) {
        this.pos++;
        return out;
      }
      if (isTemplate && ch === '$' && this.src[this.pos + 1] === '{') {
        throw new Error('不支持模板字符串插值 ${...},仅支持纯字符串');
      }
      if (ch === '\n' || ch === '\r') {
        if (!isTemplate) {
          throw new Error('普通字符串中不能直接换行(请使用 \\n 或反引号模板字符串)');
        }
        // Template literals normalize CRLF / CR to LF
        out += '\n';
        this.pos += ch === '\r' && this.src[this.pos + 1] === '\n' ? 2 : 1;
        continue;
      }
      if (ch !== '\\') {
        out += ch;
        this.pos++;
        continue;
      }

      out += this.readEscape();
    }
  }

  private readEscape(): string {
    // current char is the backslash
    const next = this.src[this.pos + 1];
    if (next === undefined) {
      throw new Error('字符串以不完整的转义结尾');
    }
    this.pos += 2;

    if (next in SIMPLE_ESCAPES) {
      return SIMPLE_ESCAPES[next];
    }
    if (next === '\r') {
      // line continuation
      if (this.src[this.pos] === '\n') {
        this.pos++;
      }
      return '';
    }
    if (next === '\n' || next === '\u2028' || next === '\u2029') {
      return '';
    }
    if (next === '0' && !/\d/.test(this.src[this.pos] ?? '')) {
      return '\0';
    }
    if (next === 'x') {
      const hex = this.src.slice(this.pos, this.pos + 2);
      if (!/^[\da-f]{2}$/i.test(hex)) {
        throw new Error('无效的 \\x 转义');
      }
      this.pos += 2;
      return String.fromCharCode(Number.parseInt(hex, 16));
    }
    if (next === 'u') {
      if (this.src[this.pos] === '{') {
        const end = this.src.indexOf('}', this.pos);
        const hex = end === -1 ? '' : this.src.slice(this.pos + 1, end);
        const codePoint = Number.parseInt(hex, 16);
        if (!/^[\da-f]{1,6}$/i.test(hex) || codePoint > 0x10ffff) {
          throw new Error('无效的 \\u{...} 转义');
        }
        this.pos = end + 1;
        return String.fromCodePoint(codePoint);
      }
      const hex = this.src.slice(this.pos, this.pos + 4);
      if (!/^[\da-f]{4}$/i.test(hex)) {
        throw new Error('无效的 \\u 转义');
      }
      this.pos += 4;
      return String.fromCharCode(Number.parseInt(hex, 16));
    }
    // \\ \' \" \` \$ and any other (non-strict "identity") escape
    return next;
  }
}

/**
 * Parse JavaScript string literals ('…', "…", `…` without ${}) optionally concatenated with `+`,
 * an optional `const/let/var name =` prefix and a trailing `;`. Never evaluates the input.
 */
export function jsStringToText(source: string): string {
  const tokenizer = new Tokenizer(source.trim().replace(/^(?:const|let|var)\s+[\w$]+\s*=/, ''));
  let result = '';
  let expectLiteral = true;

  tokenizer.skipWhitespaceAndComments();
  if (tokenizer.done) {
    return '';
  }

  for (;;) {
    tokenizer.skipWhitespaceAndComments();
    if (tokenizer.done) {
      if (expectLiteral) {
        throw new Error('"+" 后缺少字符串');
      }
      return result;
    }

    const ch = tokenizer.peek();
    if (expectLiteral) {
      if (ch !== "'" && ch !== '"' && ch !== '`') {
        throw new Error(`第 ${tokenizer.pos + 1} 个字符处应为字符串字面量('…'、"…" 或 \`…\`)`);
      }
      result += tokenizer.readStringLiteral();
      expectLiteral = false;
      continue;
    }

    if (ch === '+') {
      tokenizer.pos++;
      expectLiteral = true;
      continue;
    }
    if (ch === ';') {
      tokenizer.pos++;
      tokenizer.skipWhitespaceAndComments();
      if (!tokenizer.done) {
        throw new Error('";" 之后不应再有内容');
      }
      return result;
    }
    throw new Error(`第 ${tokenizer.pos + 1} 个字符处出现无法识别的内容 "${ch}"`);
  }
}
