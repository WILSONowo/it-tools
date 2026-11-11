import { chineseSimplifiedWordList, englishWordList, japaneseWordList } from '@it-tools/bip39';
import { describe, expect, it } from 'vitest';
import { entropyToMnemonic, generateEntropy, getEntropyError, mnemonicToEntropy } from './bip39.service';

// Trezor reference vectors: https://github.com/trezor/python-mnemonic/blob/master/vectors.json
const vectors: [string, string][] = [
  [
    '00000000000000000000000000000000',
    'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
  ],
  ['7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f', 'legal winner thank year wave sausage worth useful legal winner thank yellow'],
  ['000000000000000000000000000000000000000000000000', `${'abandon '.repeat(17)}agent`],
  ['0000000000000000000000000000000000000000000000000000000000000000', `${'abandon '.repeat(23)}art`],
  ['ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', `${'zoo '.repeat(23)}vote`],
  [
    '8080808080808080808080808080808080808080808080808080808080808080',
    'letter advice cage absurd amount doctor acoustic avoid letter advice cage absurd amount doctor acoustic avoid letter advice cage absurd amount doctor acoustic bless',
  ],
];

describe('bip39 service', () => {
  it('matches the reference vectors (12 to 24 words)', () => {
    for (const [entropy, mnemonic] of vectors) {
      expect(entropyToMnemonic(entropy, englishWordList)).toBe(mnemonic);
      expect(mnemonicToEntropy(mnemonic, englishWordList)).toBe(entropy);
    }
  });

  it('accepts 128 to 256 bits in 32-bit steps only', () => {
    for (const length of [32, 40, 48, 56, 64]) {
      expect(getEntropyError('a'.repeat(length))).toBeUndefined();
      expect(entropyToMnemonic('a'.repeat(length), englishWordList).split(' ')).toHaveLength(
        (length * 4 * 33) / 32 / 11,
      );
    }
    for (const length of [16, 20, 24, 28, 31, 36, 66, 72]) {
      expect(getEntropyError('a'.repeat(length))).toBeDefined();
      expect(() => entropyToMnemonic('a'.repeat(length), englishWordList)).toThrow();
    }
    expect(getEntropyError('')).toBeUndefined();
    expect(getEntropyError('zz'.repeat(16))).toBe('熵应为十六进制字符串');
  });

  it('rejects bad mnemonics', () => {
    expect(() => mnemonicToEntropy('abandon abandon about', englishWordList)).toThrow('数量');
    expect(() => mnemonicToEntropy(`${'abandon '.repeat(11)}abandon`, englishWordList)).toThrow('校验和');
    expect(() => mnemonicToEntropy(`${'abandon '.repeat(11)}foo`, englishWordList)).toThrow('词表');
  });

  it('round-trips other languages and spacers', () => {
    for (const list of [chineseSimplifiedWordList, japaneseWordList]) {
      const entropy = generateEntropy(256);
      expect(mnemonicToEntropy(entropyToMnemonic(entropy, list), list)).toBe(entropy);
    }
  });

  it('generates random hex entropy of the requested size', () => {
    expect(generateEntropy()).toMatch(/^[0-9a-f]{32}$/);
    expect(generateEntropy(256)).toMatch(/^[0-9a-f]{64}$/);
    expect(generateEntropy()).not.toBe(generateEntropy());
  });
});
