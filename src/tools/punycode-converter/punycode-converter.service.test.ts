import { describe, expect, it } from 'vitest';
import { convertPunycode } from './punycode-converter.service';

describe('punycode-converter', () => {
  it('converts plain domains and lowercases labels', () => {
    expect(convertPunycode('例子.测试', 'ascii')).toBe('xn--fsqu00a.xn--0zwm56d');
    expect(convertPunycode('Bücher.EXAMPLE', 'ascii')).toBe('xn--bcher-kva.example');
    expect(convertPunycode('XN--FSQU00A.XN--0ZWM56D', 'unicode')).toBe('例子.测试');
  });

  it('only converts the hostname of a full URL', () => {
    expect(convertPunycode('https://user:pw@例子.测试:8080/路径?q=中文#片段', 'ascii')).toBe(
      'https://user:pw@xn--fsqu00a.xn--0zwm56d:8080/路径?q=中文#片段',
    );
    expect(convertPunycode('https://xn--fsqu00a.xn--0zwm56d/a/b', 'unicode')).toBe('https://例子.测试/a/b');
    expect(convertPunycode('http://[::1]:80/x', 'ascii')).toBe('http://[::1]:80/x');
  });

  it('converts only the domain part of an e-mail address', () => {
    expect(convertPunycode('User@例子.测试', 'ascii')).toBe('User@xn--fsqu00a.xn--0zwm56d');
  });
});
