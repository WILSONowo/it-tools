import { describe, expect, it } from 'vitest';
import { morseToText, textToMorse } from './morse-code.service';

describe('morse-code service', () => {
  it('encodes letters separated by one space and words by " / " or two spaces', () => {
    expect(textToMorse('SOS hi', true)).toBe('... --- ... / .... ..');
    expect(textToMorse('SOS hi', false)).toBe('... --- ...  .... ..');
  });

  it('round-trips with and without the slash separator', () => {
    for (const text of ['sos 123 hello world', 'a', 'what? (yes) & no!', 'a/b c']) {
      for (const slash of [true, false]) {
        expect(morseToText(textToMorse(text, slash))).toBe(text);
      }
    }
  });

  it('decodes words separated by slashes or runs of whitespace', () => {
    expect(morseToText('.... ..   - .... . .-. .')).toBe('hi there');
    expect(morseToText('.... ..\t\t- .... . .-. .')).toBe('hi there');
    expect(morseToText('.... ../- .... . .-. .')).toBe('hi there');
    expect(morseToText('.... .. / / - .... . .-. .')).toBe('hi there');
    expect(morseToText('.... ..\n- .... . .-. .')).toBe('hi there');
  });

  it('accepts alternative dot and dash characters', () => {
    expect(morseToText('··· ——— ···')).toBe('sos');
  });

  it('handles empty input and reports unknown codes', () => {
    expect(morseToText('   ')).toBe('');
    expect(textToMorse('  ', true)).toBe('');
    expect(() => morseToText('........')).toThrow('无法识别');
    expect(() => textToMorse('中', true)).toThrow('无法编码');
  });
});
