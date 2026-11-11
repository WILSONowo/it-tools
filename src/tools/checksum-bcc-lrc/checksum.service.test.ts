import { describe, expect, it } from 'vitest';
import {
  computeChecksums,
  crc16Modbus,
  crc8,
  lrcChecksum,
  parseHexBytes,
  sumChecksum,
  xorChecksum,
} from './checksum.service';

const ascii = (text: string) => [...text].map((c) => c.charCodeAt(0));

describe('checksum service', () => {
  describe('parseHexBytes', () => {
    it('accepts space, comma separated and contiguous hex', () => {
      expect(parseHexBytes('01 03 00 0A')).toEqual({ bytes: [1, 3, 0, 10] });
      expect(parseHexBytes('01,03, 00,0a')).toEqual({ bytes: [1, 3, 0, 10] });
      expect(parseHexBytes('0103000A')).toEqual({ bytes: [1, 3, 0, 10] });
      expect(parseHexBytes('0x01 0xFF A')).toEqual({ bytes: [1, 255, 10] });
      expect(parseHexBytes('  ')).toEqual({ bytes: [] });
    });

    it('rejects non-hex and odd-length tokens', () => {
      expect(parseHexBytes('1G').error).toContain('1G');
      expect(parseHexBytes('01 zz').error).toBeDefined();
      expect(parseHexBytes('-1').error).toBeDefined();
      expect(parseHexBytes('010').error).toContain('奇数');
    });
  });

  it('matches the standard check values for "123456789"', () => {
    const data = ascii('123456789');
    expect(crc8(data)).toBe(0xf4);
    expect(crc16Modbus(data)).toBe(0x4b37);
    expect(xorChecksum(data)).toBe(0x31);
    expect(sumChecksum(data)).toBe(0xdd);
    expect(lrcChecksum(data)).toBe(0x23);
  });

  it('orders the CRC-16 bytes as requested (Modbus frame example)', () => {
    const data = [0x01, 0x03, 0x00, 0x00, 0x00, 0x0a];
    const hi = computeChecksums(data).find((r) => r.name === 'CRC-16/MODBUS');
    const lo = computeChecksums(data, { crcLowByteFirst: true }).find((r) => r.name === 'CRC-16/MODBUS');
    expect(hi?.value).toBe('CD C5');
    expect(lo?.value).toBe('C5 CD');
    // 其他校验与字节序无关
    expect(computeChecksums(data).slice(0, 5)).toEqual(computeChecksums(data, { crcLowByteFirst: true }).slice(0, 5));
  });
});
