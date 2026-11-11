const A32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const A58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const A62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const A85 = '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';

export function utf8ToBytes(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}
export function bytesToUtf8(b: Uint8Array): string {
  return new TextDecoder().decode(b);
}
export function bytesToHex(b: Uint8Array): string {
  return Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
}
export function hexToBytes(s: string): Uint8Array {
  const clean = s.replace(/\s+/g, '');
  if (!/^[0-9a-fA-F]*$/.test(clean) || clean.length % 2) throw new Error('无效的十六进制输入');
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(clean.substr(i * 2, 2), 16);
  return out;
}

export function encode16(bytes: Uint8Array): string {
  return bytesToHex(bytes);
}
export function decode16(s: string): Uint8Array {
  return hexToBytes(s);
}

export function encode32(bytes: Uint8Array): string {
  let bits = '';
  for (const x of bytes) bits += x.toString(2).padStart(8, '0');
  let out = '';
  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.slice(i, i + 5);
    out += A32[parseInt(chunk.padEnd(5, '0'), 2)];
  }
  return out.padEnd(Math.ceil(bytes.length / 5) * 8, '=');
}
export function decode32(s: string): Uint8Array {
  const clean = s.replace(/\s+/g, '').toUpperCase().replace(/=+$/, '');
  let bits = '';
  for (const ch of clean) {
    const idx = A32.indexOf(ch);
    if (idx < 0) throw new Error('无效的 Base32 输入');
    bits += idx.toString(2).padStart(5, '0');
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return new Uint8Array(bytes);
}

// bigint 通用算法(base58/62),避免大数精度问题
function toBigInt(bytes: Uint8Array): bigint {
  let n = BigInt(0);
  for (const x of bytes) n = (n << BigInt(8)) | BigInt(x);
  return n;
}
function fromBigInt(n: bigint, minBytes = 0): Uint8Array {
  if (n === BigInt(0)) return new Uint8Array(Math.max(1, minBytes));
  const arr: number[] = [];
  while (n > 0) {
    arr.unshift(Number(n & BigInt(0xff)));
    n >>= BigInt(8);
  }
  while (arr.length < minBytes) arr.unshift(0);
  return new Uint8Array(arr);
}
function countLeadingZeros(bytes: Uint8Array): number {
  let c = 0;
  while (c < bytes.length && bytes[c] === 0) c++;
  return c;
}

// 与比特币 Base58 约定一致:每个前导 0x00 字节编码为一个 alphabet[0](Base58 为 "1",Base62 为 "0"),
// 其余部分按大整数转换;因此 [0] ↔ "1"、[0, 0] ↔ "11"、[] ↔ ""。
function bigEncode(bytes: Uint8Array, alphabet: string): string {
  const base = BigInt(alphabet.length);
  const zeros = countLeadingZeros(bytes);
  let out = '';
  let v = toBigInt(bytes);
  while (v > 0) {
    out = alphabet[Number(v % base)] + out;
    v /= base;
  }
  return alphabet[0].repeat(zeros) + out;
}
function bigDecode(s: string, alphabet: string): Uint8Array {
  if (s === '') return new Uint8Array(0);
  const base = BigInt(alphabet.length);
  let zeros = 0;
  while (zeros < s.length && s[zeros] === alphabet[0]) zeros++;
  let n = BigInt(0);
  for (const ch of s) {
    const idx = alphabet.indexOf(ch);
    if (idx < 0) throw new Error('输入包含字母表外字符');
    n = n * base + BigInt(idx);
  }
  const body = n === BigInt(0) ? new Uint8Array(0) : fromBigInt(n);
  const out = new Uint8Array(zeros + body.length);
  out.set(body, zeros);
  return out;
}

export const encode58 = (b: Uint8Array) => bigEncode(b, A58);
export const decode58 = (s: string) => bigDecode(s, A58);
export const encode62 = (b: Uint8Array) => bigEncode(b, A62);
export const decode62 = (s: string) => bigDecode(s, A62);

// Base85: 每 4 字节 -> 5 字符
export function encode85(bytes: Uint8Array): string {
  let out = '';
  let i = 0;
  for (; i + 4 <= bytes.length; i += 4) {
    const n = ((bytes[i] * 256 + bytes[i + 1]) * 256 + bytes[i + 2]) * 256 + bytes[i + 3];
    if (n === 0) {
      out += 'z';
      continue;
    }
    let t = n;
    const block: string[] = [];
    for (let k = 0; k < 5; k++) {
      block.unshift(A85[t % 85]);
      t = Math.floor(t / 85);
    }
    out += block.join('');
  }
  const rem = bytes.length - i;
  if (rem > 0) {
    const buf = new Uint8Array(4);
    buf.set(bytes.slice(i));
    const n = ((buf[0] * 256 + buf[1]) * 256 + buf[2]) * 256 + buf[3];
    let t = n;
    const block: string[] = [];
    for (let k = 0; k < 5; k++) {
      block.unshift(A85[t % 85]);
      t = Math.floor(t / 85);
    }
    out += block.join('').slice(0, rem + 1);
  }
  return out;
}
export function decode85(s: string): Uint8Array {
  const clean = s.replace(/\s+/g, '').replace(/<~|~>/g, '');
  const bytes: number[] = [];
  let i = 0;
  while (i < clean.length) {
    if (clean[i] === 'z') {
      bytes.push(0, 0, 0, 0);
      i++;
      continue;
    }
    // 末尾不足 5 字符的组
    const group = clean.slice(i, i + 5);
    if (group.length < 5) {
      // 填充到 5 再取前 rem+1 字符
      const full = (group + 'uuuuu').slice(0, 5);
      let n = 0;
      for (let k = 0; k < 5; k++) {
        const idx = A85.indexOf(full[k]);
        if (idx < 0) throw new Error('无效的 Base85 输入');
        n = n * 85 + idx;
      }
      const outBytes = group.length - 1;
      const tmp = [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff];
      bytes.push(...tmp.slice(0, outBytes));
      break;
    }
    let n = 0;
    for (let k = 0; k < 5; k++) {
      const idx = A85.indexOf(group[k]);
      if (idx < 0) throw new Error('无效的 Base85 输入');
      n = n * 85 + idx;
    }
    bytes.push((n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff);
    i += 5;
  }
  return new Uint8Array(bytes);
}
