import { randomString } from '@/utils/random';

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '.,;:!?/-"\'#{([|\\@)]=}*+';

export function createToken({
  withUppercase = true,
  withLowercase = true,
  withNumbers = true,
  withSymbols = false,
  length = 64,
  alphabet,
  exclude = '',
}: {
  withUppercase?: boolean;
  withLowercase?: boolean;
  withNumbers?: boolean;
  withSymbols?: boolean;
  length?: number;
  alphabet?: string;
  exclude?: string;
}) {
  let allAlphabet =
    alphabet ??
    [
      ...(withUppercase ? UPPERCASE : ''),
      ...(withLowercase ? LOWERCASE : ''),
      ...(withNumbers ? NUMBERS : ''),
      ...(withSymbols ? SYMBOLS : ''),
    ].join('');

  if (exclude.length > 0) {
    allAlphabet = [...allAlphabet].filter((char) => !exclude.includes(char)).join('');
  }

  if (allAlphabet.length === 0) {
    return '';
  }

  // Each character is drawn independently with crypto.getRandomValues.
  return randomString([...new Set(allAlphabet)], length);
}
