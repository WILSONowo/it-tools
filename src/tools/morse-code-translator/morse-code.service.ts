const LETTERS: Record<string, string> = {
  a: '.-',
  b: '-...',
  c: '-.-.',
  d: '-..',
  e: '.',
  f: '..-.',
  g: '--.',
  h: '....',
  i: '..',
  j: '.---',
  k: '-.-',
  l: '.-..',
  m: '--',
  n: '-.',
  o: '---',
  p: '.--.',
  q: '--.-',
  r: '.-.',
  s: '...',
  t: '-',
  u: '..-',
  v: '...-',
  w: '.--',
  x: '-..-',
  y: '-.--',
  z: '--..',
  '0': '-----',
  '1': '.----',
  '2': '..---',
  '3': '...--',
  '4': '....-',
  '5': '.....',
  '6': '-....',
  '7': '--...',
  '8': '---..',
  '9': '----.',
  '.': '.-.-.-',
  ',': '--..--',
  '?': '..--..',
  "'": '.----.',
  '!': '-.-.--',
  '/': '-..-.',
  '(': '-.--.',
  ')': '-.--.-',
  '&': '.-...',
  ':': '---...',
  ';': '-.-.-.',
  '=': '-...-',
  '+': '.-.-.',
  '-': '-....-',
  _: '..--.-',
  '"': '.-..-.',
  $: '...-..-',
  '@': '.--.-.',
};

const MORSE_TO_CHAR = Object.fromEntries(Object.entries(LETTERS).map(([char, code]) => [code, char]));

export function textToMorse(text: string, wordSeparator: boolean): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const result = words
    .map((word) =>
      word
        .toLowerCase()
        .split('')
        .map((char) => {
          if (!LETTERS[char]) throw new Error(`无法编码字符: ${char}`);
          return LETTERS[char];
        })
        .join(' '),
    )
    .join(wordSeparator ? ' / ' : '  ');

  return result;
}

export function morseToText(morse: string): string {
  // 兼容常见的点/划替代字符
  const cleaned = morse
    .trim()
    .replace(/[·•∙]/g, '.')
    .replace(/[—–−_]/g, '-');
  if (cleaned === '') return '';

  // 单词之间用 /、换行或两个及以上空白分隔(对应摩斯电码中 7 个单位的词间隔);字母之间用单个空白分隔
  const words = cleaned.split(/\s*\/\s*|\s*\n\s*|\s{2,}/).filter((word) => word.trim() !== '');
  const result = words
    .map((word) =>
      word
        .split(/\s+/)
        .filter(Boolean)
        .map((code) => {
          if (!MORSE_TO_CHAR[code]) throw new Error(`无法识别的摩斯码: ${code}`);
          return MORSE_TO_CHAR[code];
        })
        .join(''),
    )
    .join(' ');

  return result;
}
