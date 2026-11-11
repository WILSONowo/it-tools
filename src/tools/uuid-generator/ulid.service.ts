// ULID 规范:https://github.com/ulid/spec
// 26 个字符的 Crockford Base32:前 10 位为 48 位毫秒时间戳,后 16 位为 80 位随机数
export const ULID_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const TIME_LENGTH = 10;
const RANDOM_LENGTH = 16;
const TIME_MAX = 2 ** 48 - 1;

export function encodeUlidTime(time: number): string {
  if (!Number.isInteger(time) || time < 0 || time > TIME_MAX) {
    throw new Error('ULID 时间戳必须是 0 到 2^48-1 之间的整数毫秒');
  }

  let remaining = time;
  let out = '';
  for (let i = 0; i < TIME_LENGTH; i++) {
    out = ULID_ALPHABET[remaining % 32] + out;
    remaining = Math.floor(remaining / 32);
  }
  return out;
}

export function encodeUlidRandom(bytes: Uint8Array): string {
  if (bytes.length !== 10) {
    throw new Error('ULID 随机部分需要 10 个字节(80 位)');
  }

  let out = '';
  let buffer = 0;
  let bitCount = 0;
  for (const byte of bytes) {
    buffer = (buffer << 8) | byte;
    bitCount += 8;
    while (bitCount >= 5) {
      bitCount -= 5;
      out += ULID_ALPHABET[(buffer >> bitCount) & 31];
    }
    buffer &= (1 << bitCount) - 1;
  }
  return out;
}

export function generateUlid({
  now = Date.now(),
  getRandomValues = (array: Uint8Array) => crypto.getRandomValues(array),
}: {
  now?: number;
  getRandomValues?: (array: Uint8Array) => Uint8Array;
} = {}): string {
  return encodeUlidTime(now) + encodeUlidRandom(getRandomValues(new Uint8Array(10)));
}

export function decodeUlidTime(ulid: string): number {
  const timePart = ulid.toUpperCase().slice(0, TIME_LENGTH);
  if (ulid.length !== TIME_LENGTH + RANDOM_LENGTH || ![...ulid.toUpperCase()].every((c) => ULID_ALPHABET.includes(c))) {
    throw new Error('无效的 ULID');
  }
  return [...timePart].reduce((acc, char) => acc * 32 + ULID_ALPHABET.indexOf(char), 0);
}
