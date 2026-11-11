import { describe, expect, it } from 'vitest';
import { codesByCategories } from './http-status-codes.constants';
import { tool } from './index';

describe('http-status-codes keywords', () => {
  it('stay in sync with the status code table', () => {
    const expected = codesByCategories.flatMap(({ codes }) => codes.flatMap(({ code, name }) => [String(code), name]));
    expect(tool.keywords).toEqual(['http', 'status', 'codes', ...expected]);
  });
});
