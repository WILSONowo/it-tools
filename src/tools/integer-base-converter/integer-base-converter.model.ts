const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/';

function assertBase(base: number) {
  if (!Number.isInteger(base) || base < 2 || base > 64) {
    throw new Error(`进制必须是 2 到 64 之间的整数(当前为 ${base})。`);
  }
}

/**
 * 在 2~64 进制之间转换任意大小的整数(使用 BigInt,不会丢失精度)。
 * - 进制 ≤ 36 时字母不区分大小写(`FF` 与 `ff` 等价)。
 * - 进制 > 36 时使用字母表 0-9a-zA-Z+/,区分大小写。
 *   注意:64 进制只是"数值进制",与 Base64 编码(A-Za-z0-9+/)不是一回事。
 * - 支持前导 `-` 表示负数。
 */
export function convertBase({ value, fromBase, toBase }: { value: string; fromBase: number; toBase: number }) {
  assertBase(fromBase);
  assertBase(toBase);

  let digits = value.trim();
  let negative = false;
  if (digits.startsWith('-')) {
    negative = true;
    digits = digits.slice(1);
  }
  if (digits === '') {
    throw new Error('请输入数字。');
  }
  if (fromBase <= 36) {
    digits = digits.toLowerCase();
  }

  const bigFrom = BigInt(fromBase);
  const bigTo = BigInt(toBase);

  const ZERO = BigInt(0);
  let decValue = ZERO;
  for (const digit of digits) {
    const index = ALPHABET.indexOf(digit);
    if (index === -1 || index >= fromBase) {
      throw new Error(`数字 "${digit}" 对于 ${fromBase} 进制无效。`);
    }
    decValue = decValue * bigFrom + BigInt(index);
  }

  let newValue = '';
  while (decValue > ZERO) {
    newValue = ALPHABET[Number(decValue % bigTo)] + newValue;
    decValue /= bigTo;
  }
  newValue ||= '0';

  return negative && newValue !== '0' ? `-${newValue}` : newValue;
}
