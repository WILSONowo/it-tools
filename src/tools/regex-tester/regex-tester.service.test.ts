import { describe, expect, it } from 'vitest';
import { replaceWithRegex, toNativeReplacement } from './regex-tester.service';

const date = /(\d{4})-(\d{2})-(\d{2})/;
const text = 'Today: 2023-11-15, and also 2023-11-16.';

describe('toNativeReplacement', () => {
  it('converts the extra syntax to native tokens', () => {
    expect(toNativeReplacement('\\3/\\2/\\1')).toBe('$3/$2/$1');
    expect(toNativeReplacement('${year}')).toBe('$<year>');
    expect(toNativeReplacement('\\$1')).toBe('$$1');
    expect(toNativeReplacement('$1 $& $<y>')).toBe('$1 $& $<y>');
  });
});

describe('replaceWithRegex', () => {
  it('maps $1 to the first capture group', () => {
    expect(replaceWithRegex(text, new RegExp(date, 'g'), '$3/$2/$1')).toBe('Today: 15/11/2023, and also 16/11/2023.');
  });

  it('replaces only the first match without the g flag (no infinite loop)', () => {
    expect(replaceWithRegex(text, new RegExp(date, ''), '$3/$2/$1')).toBe('Today: 15/11/2023, and also 2023-11-16.');
  });

  it('supports backslash and named-group syntax', () => {
    expect(replaceWithRegex(text, new RegExp(date, 'g'), '\\3.\\2.\\1')).toBe(
      'Today: 15.11.2023, and also 16.11.2023.',
    );
    const named = /(?<y>\d{4})-(?<m>\d{2})-(?<d>\d{2})/g;
    expect(replaceWithRegex(text, named, '${d}/${m}/${y}')).toBe('Today: 15/11/2023, and also 16/11/2023.');
    expect(replaceWithRegex(text, named, '$<d>/$<m>')).toBe('Today: 15/11, and also 16/11.');
  });

  it('supports $& and escaped dollars', () => {
    expect(replaceWithRegex('a1b2', /\d/g, '[$&]')).toBe('a[1]b[2]');
    expect(replaceWithRegex('a1', /\d/g, '\\$1')).toBe('a$1');
  });

  it('handles zero-length matches', () => {
    expect(replaceWithRegex('abc', /(?:)/g, '-')).toBe('-a-b-c-');
    expect(replaceWithRegex('abc', /(?:)/, '-')).toBe('-abc');
  });

  it('is not affected by a stale lastIndex', () => {
    const regex = /\d/g;
    regex.lastIndex = 3;
    expect(replaceWithRegex('a1b2', regex, 'x')).toBe('axbx');
  });
});
