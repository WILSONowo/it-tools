import { describe, expect, it } from 'vitest';
import { textToNatoAlphabet } from './text-to-nato-alphabet.service';

describe('text-to-nato-alphabet', () => {
  it('uses the ICAO spellings Alfa and Juliett', () => {
    expect(textToNatoAlphabet({ text: 'aJz' })).toBe('Alfa Juliett Zulu');
    expect(textToNatoAlphabet({ text: 'a1' })).toBe('Alfa 1');
  });
});
