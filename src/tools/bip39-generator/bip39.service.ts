import { SHA256, enc } from 'crypto-js';

export interface Bip39WordList {
  words: string[];
  spacer: string;
}

// BIP39 允许 128~256 位熵,步长 32 位,对应 12/15/18/21/24 个助记词
export const ALLOWED_ENTROPY_BITS = [128, 160, 192, 224, 256];
export const ALLOWED_WORD_COUNTS = ALLOWED_ENTROPY_BITS.map((bits) => (bits + bits / 32) / 11);

export function getEntropyError(entropy: string): string | undefined {
  if (!/^[a-fA-F0-9]*$/.test(entropy)) {
    return '熵应为十六进制字符串';
  }
  if (entropy !== '' && !ALLOWED_ENTROPY_BITS.includes(entropy.length * 4)) {
    return '熵长度应为 32、40、48、56 或 64 个十六进制字符(128~256 位,步长 32 位)';
  }
  return undefined;
}

function hexToBytes(hex: string): number[] {
  return (hex.match(/.{2}/g) ?? []).map((byte) => parseInt(byte, 16));
}

function bytesToBinary(bytes: number[]): string {
  return bytes.map((byte) => byte.toString(2).padStart(8, '0')).join('');
}

function checksumBits(bytes: number[]): string {
  const hashHex = SHA256(enc.Hex.parse(bytes.map((b) => b.toString(16).padStart(2, '0')).join(''))).toString(enc.Hex);
  return bytesToBinary(hexToBytes(hashHex)).slice(0, (bytes.length * 8) / 32);
}

export function entropyToMnemonic(entropy: string, wordList: Bip39WordList): string {
  const error = getEntropyError(entropy);
  if (error || entropy === '') {
    throw new Error(error ?? '熵不能为空');
  }

  const bytes = hexToBytes(entropy);
  const bits = bytesToBinary(bytes) + checksumBits(bytes);
  return (bits.match(/.{11}/g) ?? []).map((chunk) => wordList.words[parseInt(chunk, 2)]).join(wordList.spacer);
}

export function mnemonicToEntropy(mnemonic: string, wordList: Bip39WordList): string {
  const words = mnemonic
    .normalize('NFKD')
    .trim()
    .split(/\s+/) // \s 已包含日语词表使用的全角空格 U+3000
    .filter(Boolean);
  if (!ALLOWED_WORD_COUNTS.includes(words.length)) {
    throw new Error('助记词数量应为 12、15、18、21 或 24 个');
  }

  const normalizedList = wordList.words.map((word) => word.normalize('NFKD'));
  const bits = words
    .map((word) => {
      const index = normalizedList.indexOf(word);
      if (index === -1) {
        throw new Error(`助记词不在词表中:${word}`);
      }
      return index.toString(2).padStart(11, '0');
    })
    .join('');

  const entropyBitLength = (words.length * 11 * 32) / 33;
  const bytes = (bits.slice(0, entropyBitLength).match(/.{8}/g) ?? []).map((byte) => parseInt(byte, 2));
  if (checksumBits(bytes) !== bits.slice(entropyBitLength)) {
    throw new Error('助记词校验和错误');
  }

  return bytes.map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function generateEntropy(bits = 128): string {
  const bytes = crypto.getRandomValues(new Uint8Array(bits / 8));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}
