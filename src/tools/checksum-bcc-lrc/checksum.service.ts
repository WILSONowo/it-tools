export function parseHexBytes(
  input: string,
): { bytes: number[]; error?: undefined } | { bytes?: undefined; error: string } {
  const tokens = input.split(/[\s,;]+/).filter(Boolean);
  const bytes: number[] = [];

  for (const rawToken of tokens) {
    const token = rawToken.replace(/^0x/i, '');
    if (!/^[0-9a-fA-F]+$/.test(token)) {
      return { error: `「${rawToken}」不是有效的十六进制` };
    }
    if (token.length <= 2) {
      bytes.push(parseInt(token, 16));
      continue;
    }
    // 连续书写的十六进制(如 010300)按每两个字符一个字节拆分
    if (token.length % 2 !== 0) {
      return { error: `「${rawToken}」长度为奇数,无法按字节拆分` };
    }
    for (let i = 0; i < token.length; i += 2) {
      bytes.push(parseInt(token.slice(i, i + 2), 16));
    }
  }

  return { bytes };
}

export function xorChecksum(data: number[]): number {
  return data.reduce((acc, byte) => acc ^ byte, 0);
}

export function sumChecksum(data: number[]): number {
  return data.reduce((acc, byte) => (acc + byte) & 0xff, 0);
}

export function lrcChecksum(data: number[]): number {
  return (~sumChecksum(data) + 1) & 0xff;
}

/** CRC-8/SMBUS:多项式 0x07,初始值 0,不反射,无最终异或 */
export function crc8(data: number[]): number {
  let crc = 0;
  for (const byte of data) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) {
      crc = crc & 0x80 ? ((crc << 1) ^ 0x07) & 0xff : (crc << 1) & 0xff;
    }
  }
  return crc;
}

/** CRC-16/MODBUS:多项式 0x8005(反射 0xA001),初始值 0xFFFF */
export function crc16Modbus(data: number[]): number {
  let crc = 0xffff;
  for (const byte of data) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xa001 : crc >>> 1;
    }
  }
  return crc;
}

const hex = (value: number) => value.toString(16).toUpperCase().padStart(2, '0');

export function computeChecksums(data: number[], { crcLowByteFirst = false }: { crcLowByteFirst?: boolean } = {}) {
  const sum = sumChecksum(data);
  const crc16 = crc16Modbus(data);
  const crc16Bytes = crcLowByteFirst ? [crc16 & 0xff, crc16 >> 8] : [crc16 >> 8, crc16 & 0xff];

  return [
    { name: 'XOR (BCC)', value: hex(xorChecksum(data)), note: '逐字节异或' },
    { name: '求和 (mod 256)', value: hex(sum), note: '逐字节求和取低 8 位' },
    { name: '和取反', value: hex(~sum & 0xff), note: '对总和取反(~sum)' },
    { name: 'LRC (2 的补码)', value: hex(lrcChecksum(data)), note: '(~sum + 1) 纵向冗余校验' },
    { name: 'CRC-8 (多项式 0x07)', value: hex(crc8(data)), note: '初始值 0, 多项式 x8+x2+x+1' },
    {
      name: 'CRC-16/MODBUS',
      value: crc16Bytes.map(hex).join(' '),
      note: crcLowByteFirst
        ? '初始值 FFFF, 多项式 0x8005(反射);低字节在前,即 Modbus 报文中的发送顺序'
        : '初始值 FFFF, 多项式 0x8005(反射);高字节在前',
    },
  ];
}
