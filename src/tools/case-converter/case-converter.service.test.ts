import { describe, expect, it } from 'vitest';
import { camelCase, pascalCase, snakeCase } from 'change-case';
import { caseConverterConfig } from './case-converter.service';

describe('case-converter', () => {
  it('keeps digits', () => {
    expect(snakeCase('oauth2 token v3', caseConverterConfig)).toBe('oauth2_token_v3');
    expect(camelCase('oauth2 token v3', caseConverterConfig)).toBe('oauth2TokenV3');
  });

  it('keeps CJK and accented letters', () => {
    expect(snakeCase('用户 名称-id', caseConverterConfig)).toBe('用户_名称_id');
    expect(pascalCase('élan vital', caseConverterConfig)).toBe('ÉlanVital');
  });

  it('strips punctuation', () => {
    expect(snakeCase('hello, world! (test)', caseConverterConfig)).toBe('hello_world_test');
  });
});
