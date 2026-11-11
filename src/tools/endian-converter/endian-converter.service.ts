/**
 * Parse an unsigned integer written in decimal (`305419896`) or hexadecimal (`0x12345678`).
 * Throws an Error with a user facing message on invalid input.
 */
export function parseUnsignedInteger(input: string): bigint {
  const raw = input.trim().replace(/_/g, '');
  if (raw === '') throw new Error('请输入整数');
  if (raw.startsWith('-')) throw new Error('不支持负数,请使用无符号整数');
  if (/^0x[0-9a-f]+$/i.test(raw)) return BigInt(raw);
  if (/^\d+$/.test(raw)) return BigInt(raw);
  throw new Error('无效的整数:请输入十进制数字或以 0x 开头的十六进制数');
}

export function toHexBytes(value: bigint, byteCount: number): string[] {
  const bytes: string[] = [];
  let v = value;
  for (let i = 0; i < byteCount; i++) {
    bytes.unshift((v & BigInt(0xff)).toString(16).padStart(2, '0'));
    v >>= BigInt(8);
  }
  return bytes;
}

export function integerToEndianBytes(input: string, byteCount: number): { bigEndian: string; littleEndian: string } {
  const value = parseUnsignedInteger(input);
  if (value >= BigInt(2) ** BigInt(byteCount * 8)) {
    throw new Error(`数值超出 ${byteCount} 字节无符号范围`);
  }

  const bytes = toHexBytes(value, byteCount);
  return { bigEndian: bytes.join(' '), littleEndian: [...bytes].reverse().join(' ') };
}

/**
 * Parse hex bytes, either space separated (`12 34 56 78`) or contiguous (`12345678`, `0x12345678`).
 * A contiguous string of odd length is left-padded with a zero (`123` → `01 23`).
 */
export function parseHexBytes(input: string): number[] {
  const tokens = input.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) throw new Error('请输入十六进制字节');

  if (tokens.length === 1) {
    const hex = tokens[0].replace(/^0x/i, '');
    if (!/^[0-9a-f]+$/i.test(hex)) throw new Error('请输入合法的十六进制字节(00-FF)');
    const padded = hex.length % 2 === 1 ? `0${hex}` : hex;
    return (padded.match(/../g) ?? []).map((b) => parseInt(b, 16));
  }

  if (!tokens.every((b) => /^[0-9a-f]{1,2}$/i.test(b))) {
    throw new Error('请输入合法的十六进制字节(00-FF)');
  }
  return tokens.map((b) => parseInt(b, 16));
}

export function bytesToEndianIntegers(input: string): { bigEndian: string; littleEndian: string } {
  const bytes = parseHexBytes(input);
  const read = (list: number[]) => list.reduce((acc, b) => (acc << BigInt(8)) | BigInt(b), BigInt(0)).toString(10);
  return { bigEndian: read(bytes), littleEndian: read([...bytes].reverse()) };
}
