function mod26(value: number): number {
  return ((value % 26) + 26) % 26;
}

function isAsciiLetter(char: string): boolean {
  return /^[A-Za-z]$/.test(char);
}

function shiftChar(char: string, shift: number): string {
  if (!isAsciiLetter(char)) return char;
  const base = char <= 'Z' ? 65 : 97;
  return String.fromCharCode(mod26(char.charCodeAt(0) - base + shift) + base);
}

/** 清空输入框时 n-input-number 会给出 null,按 0 处理;任意整数偏移都会取模 26 */
export function normalizeShift(shift: number | null | undefined): number {
  if (shift === null || shift === undefined || !Number.isFinite(shift)) return 0;
  return Math.round(shift);
}

export function caesarShift(text: string, shift: number | null | undefined): string {
  const normalized = normalizeShift(shift);
  return [...text].map((char) => shiftChar(char, normalized)).join('');
}

export function caesarBruteForce(text: string): string {
  const lines: string[] = [];
  for (let shift = 1; shift <= 25; shift++) {
    lines.push(`偏移 ${shift.toString().padStart(2, ' ')}: ${caesarShift(text, -shift)}`);
  }
  return lines.join('\n');
}

/** 去掉密钥中的空白;只允许英文字母 */
export function parseVigenereKey(
  key: string,
): { shifts: number[]; error?: undefined } | { shifts?: undefined; error: string } {
  const cleaned = key.replace(/\s+/g, '');
  if (cleaned === '') return { error: '请输入密钥' };
  if (!/^[a-zA-Z]+$/.test(cleaned)) return { error: '密钥只能包含英文字母' };
  return { shifts: [...cleaned.toUpperCase()].map((char) => char.charCodeAt(0) - 65) };
}

/** 非字母字符原样保留且不消耗密钥位置(与常见实现一致) */
export function vigenere({ text, key, mode }: { text: string; key: string; mode: 'encrypt' | 'decrypt' }): {
  output: string;
  error?: string;
} {
  const parsed = parseVigenereKey(key);
  if (parsed.error !== undefined) {
    return { output: '', error: parsed.error };
  }

  const { shifts } = parsed;
  const direction = mode === 'encrypt' ? 1 : -1;
  let keyIndex = 0;
  const output = [...text]
    .map((char) => {
      if (!isAsciiLetter(char)) return char;
      const shift = shifts[keyIndex % shifts.length];
      keyIndex++;
      return shiftChar(char, direction * shift);
    })
    .join('');

  return { output };
}
