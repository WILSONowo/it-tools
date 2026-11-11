import { describe, expect, it } from 'vitest';
import {
  countCombinations,
  generateComboUrls,
  generateTemplateUrls,
  parseVarConfig,
} from './url-batch-generator.service';

describe('url-batch-generator', () => {
  it('parses the variable config', () => {
    const vars = parseVarConfig('id = 1 | 2 | 3\ntype = a | b\ninvalid line\n = x');
    expect([...vars.entries()]).toEqual([
      ['id', ['1', '2', '3']],
      ['type', ['a', 'b']],
    ]);
    expect(countCombinations(vars)).toBe(6);
  });

  it('generates the cartesian product of parameters', () => {
    const { urls, error } = generateComboUrls({ base: 'https://e.com/api', config: 'id = 1 | 2\nq = a b' });
    expect(error).toBeUndefined();
    expect(urls).toEqual(['https://e.com/api?id=1&q=a%20b', 'https://e.com/api?id=2&q=a%20b']);
  });

  it('appends with & when the base already has a query', () => {
    expect(generateComboUrls({ base: 'https://e.com/?x=1', config: 'id = 1' }).urls).toEqual([
      'https://e.com/?x=1&id=1',
    ]);
  });

  it('refuses to generate more than the limit without computing the product', () => {
    const config = Array.from(
      { length: 10 },
      (_, i) => `p${i} = ${Array.from({ length: 10 }, (_, j) => j).join(' | ')}`,
    ).join('\n');
    const result = generateComboUrls({ base: 'https://e.com', config });
    expect(result.urls).toEqual([]);
    expect(result.error).toContain('10,000,000,000');

    const small = generateComboUrls({ base: 'https://e.com', config: 'a = 1 | 2 | 3', max: 2 });
    expect(small.urls).toEqual([]);
    expect(small.error).toBeDefined();
  });

  it('fills templates', () => {
    const { urls } = generateTemplateUrls({ template: 'https://e.com/{{a}}-{{b}}/{{a}}', config: 'a = x | y\nb = 1' });
    expect(urls).toEqual(['https://e.com/x-1/x', 'https://e.com/y-1/y']);
  });
});
