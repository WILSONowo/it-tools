import { describe, expect, it } from 'vitest';
import { formatHtml, loadHtmlFormatter } from './html-formatter.service';

describe('html-formatter', () => {
  it('lazily loads prettier and formats html', async () => {
    expect(await formatHtml('<h1>Hey!</h1><p>Welcome</p>')).toBe('<h1>Hey!</h1>\n<p>Welcome</p>\n');
  });

  it('caches the formatter', async () => {
    expect(await loadHtmlFormatter()).toBe(await loadHtmlFormatter());
  });

  it('falls back to the raw input on parse errors', async () => {
    expect(await formatHtml('<div')).toBe('<div');
  });
});
