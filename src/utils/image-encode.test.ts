import { describe, expect, it } from 'vitest';
import { buildIco } from './image-encode';

function fakePng(len: number, seed: number) {
  const bytes = new Uint8Array(len);
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  for (let i = 8; i < len; i++) bytes[i] = (i * seed) & 0xff;
  return bytes;
}

function parseIco(buf: Uint8Array) {
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const count = view.getUint16(4, true);
  const entries = Array.from({ length: count }, (_, i) => {
    const o = 6 + i * 16;
    return {
      width: view.getUint8(o) || 256,
      height: view.getUint8(o + 1) || 256,
      colors: view.getUint8(o + 2),
      reserved: view.getUint8(o + 3),
      planes: view.getUint16(o + 4, true),
      bitCount: view.getUint16(o + 6, true),
      size: view.getUint32(o + 8, true),
      offset: view.getUint32(o + 12, true),
    };
  });
  return { reserved: view.getUint16(0, true), type: view.getUint16(2, true), count, entries };
}

describe('buildIco', () => {
  it('writes a valid ICONDIR and directory entries', () => {
    const images = [
      { width: 16, height: 16, png: fakePng(40, 3) },
      { width: 48, height: 48, png: fakePng(70, 5) },
      { width: 256, height: 256, png: fakePng(100, 7) },
    ];
    const ico = buildIco(images);
    const parsed = parseIco(ico);

    expect(parsed.reserved).toBe(0);
    expect(parsed.type).toBe(1);
    expect(parsed.count).toBe(3);
    expect(ico.byteLength).toBe(6 + 3 * 16 + 40 + 70 + 100);

    let expectedOffset = 6 + 3 * 16;
    parsed.entries.forEach((e, i) => {
      expect(e.width).toBe(images[i].width);
      expect(e.height).toBe(images[i].height);
      expect(e.colors).toBe(0);
      expect(e.reserved).toBe(0);
      expect(e.planes).toBe(1);
      expect(e.bitCount).toBe(32);
      expect(e.size).toBe(images[i].png.byteLength);
      expect(e.offset).toBe(expectedOffset);
      expect(ico.slice(e.offset, e.offset + e.size)).toEqual(images[i].png);
      expectedOffset += e.size;
    });
  });

  it('stores 256 as 0 in the one-byte size fields', () => {
    const ico = buildIco([{ width: 256, height: 256, png: fakePng(20, 1) }]);
    expect(ico[6]).toBe(0);
    expect(ico[7]).toBe(0);
  });

  it('rejects sizes over 256 and empty input', () => {
    expect(() => buildIco([{ width: 512, height: 512, png: fakePng(20, 1) }])).toThrow('1-256');
    expect(() => buildIco([])).toThrow();
  });
});
