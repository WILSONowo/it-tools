import { AES, Rabbit, RC4, TripleDES, enc } from 'crypto-js';

export const algos = { AES, TripleDES, Rabbit, RC4 };
export type CipherAlgo = keyof typeof algos;

export const DECRYPT_ERROR = '解密失败:密钥错误或密文无效';

export function encryptText({ algo, text, secret }: { algo: CipherAlgo; text: string; secret: string }): string {
  return algos[algo].encrypt(text, secret).toString();
}

export function decryptText({ algo, cipherText, secret }: { algo: CipherAlgo; cipherText: string; secret: string }): {
  output: string;
  error?: string;
} {
  if (cipherText.trim() === '') {
    return { output: '' };
  }

  try {
    const words = algos[algo].decrypt(cipherText.trim(), secret);

    // crypto-js 在密钥错误时不会抛错,而是返回长度为负或为 0 的结果,或在 UTF-8 解码时抛出 "Malformed UTF-8 data"
    if (words.sigBytes < 0) {
      return { output: '', error: DECRYPT_ERROR };
    }

    const output = words.toString(enc.Utf8);

    if (output === '' && words.sigBytes !== 0) {
      return { output: '', error: DECRYPT_ERROR };
    }

    return { output };
  } catch (_) {
    return { output: '', error: DECRYPT_ERROR };
  }
}
