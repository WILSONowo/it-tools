import { describe, expect, it } from 'vitest';
import {
  decodeBase64,
  encodeBase64,
  fromUrlSafeBase64,
  isValidBase64Input,
  toUrlSafeBase64,
} from './base64-string-converter.service';

describe('base64-string-converter', () => {
  it('converts between standard and URL-safe alphabets', () => {
    expect(toUrlSafeBase64('+/+/ab==')).toBe('-_-_ab');
    expect(fromUrlSafeBase64('-_-_ab')).toBe('+/+/ab==');
    expect(fromUrlSafeBase64('YQ')).toBe('YQ==');
    expect(fromUrlSafeBase64('YWJj')).toBe('YWJj');
  });

  it('encodes with or without the URL-safe option', () => {
    expect(encodeBase64('??>')).toBe('Pz8+');
    expect(encodeBase64('??>', { urlSafe: true })).toBe('Pz8-');
    expect(encodeBase64('a')).toBe('YQ==');
    expect(encodeBase64('a', { urlSafe: true })).toBe('YQ');
    expect(encodeBase64('中文', { urlSafe: true })).toBe('5Lit5paH');
  });

  it('decodes unpadded URL-safe input only in URL-safe mode', () => {
    expect(decodeBase64('Pz8-', { urlSafe: true })).toBe('??>');
    expect(decodeBase64('YQ', { urlSafe: true })).toBe('a');
    expect(isValidBase64Input('YQ', { urlSafe: true })).toBe(true);
    expect(isValidBase64Input('YQ')).toBe(false);
    expect(isValidBase64Input('Pz8-')).toBe(false);
    expect(isValidBase64Input('Y', { urlSafe: true })).toBe(false);
    expect(isValidBase64Input('YQ==')).toBe(true);
  });
});
