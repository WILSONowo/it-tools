import { shuffleString } from '@/utils/random';

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
      ...(withUppercase ? 'ABCDEFGHIJKLMOPQRSTUVWXYZ' : ''),
      ...(withLowercase ? 'abcdefghijklmopqrstuvwxyz' : ''),
      ...(withNumbers ? '0123456789' : ''),
      ...(withSymbols ? '.,;:!?./-"\'#{([-|\\@)]=}*+' : ''),
    ].join('');

  if (exclude.length > 0) {
    allAlphabet = [...allAlphabet].filter((char) => !exclude.includes(char)).join('');
  }

  if (allAlphabet.length === 0) {
    return '';
  }

  return shuffleString(allAlphabet.repeat(length)).substring(0, length);
}
