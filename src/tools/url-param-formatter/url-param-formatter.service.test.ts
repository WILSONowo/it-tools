import { describe, expect, it } from 'vitest';
import { buildQuery, extractQuery, pairsToJson, pairsToLines, parsePairs } from './url-param-formatter.service';

describe('url-param-formatter', () => {
  it('extracts the query and strips the fragment', () => {
    expect(extractQuery('https://e.com/p?a=1&b=2#section')).toBe('a=1&b=2');
    expect(extractQuery('a=1#x')).toBe('a=1');
    expect(extractQuery('https://e.com/#/route?x=1')).toBe('');
  });

  it('decodes + as a space and percent-escapes', () => {
    expect(parsePairs('?q=hello+world&c=%E4%B8%AD%E6%96%87&flag')).toEqual([
      ['q', 'hello world'],
      ['c', '中文'],
      ['flag', ''],
    ]);
    expect(() => parsePairs('?a=%E0%A4')).toThrow();
  });

  it('builds JSON with special keys and repeated keys', () => {
    const json = JSON.parse(pairsToJson(parsePairs('toString=1&__proto__=2&constructor=3&a=1&a=2')));
    expect(json.toString).toBe('1');
    expect(Object.getOwnPropertyNames(json)).toContain('__proto__');
    expect(json.constructor).toBe('3');
    expect(json.a).toEqual(['1', '2']);
  });

  it('formats pairs as lines', () => {
    expect(
      pairsToLines([
        ['a', '1'],
        ['b', '2'],
      ]),
    ).toBe('a = 1\nb = 2');
  });

  it('trims keys and values when building a query', () => {
    expect(buildQuery('a = 1\nb = hello world\n\nflag', true)).toBe('?a=1&b=hello%20world&flag=');
    expect(buildQuery(' a = 1 ', false)).toBe('?a=1');
  });
});
