import { get2dContext } from './canvas';
// 浏览器端图片编码工具:canvas → BMP / ICO

export function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG 编码失败'))), 'image/png');
  });
}

// 简单 BMP(24 位,自下而上行)编码
export function canvasToBmpBlob(canvas: HTMLCanvasElement): Blob {
  const w = canvas.width;
  const h = canvas.height;
  const ctx = get2dContext(canvas);
  const imageData = ctx.getImageData(0, 0, w, h).data;
  const rowSize = Math.floor((24 * w + 31) / 32) * 4;
  const pixelArraySize = rowSize * h;
  const fileSize = 54 + pixelArraySize;

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  // BITMAPFILEHEADER
  view.setUint8(0, 0x42); // B
  view.setUint8(1, 0x4d); // M
  view.setUint32(2, fileSize, true);
  view.setUint32(10, 54, true); // pixel data offset

  // BITMAPINFOHEADER
  view.setUint32(14, 40, true);
  view.setInt32(18, w, true);
  view.setInt32(22, h, true); // positive = bottom-up
  view.setUint16(26, 1, true);
  view.setUint16(28, 24, true);
  view.setUint32(30, 0, true);
  view.setUint32(34, pixelArraySize, true);

  // pixels (BGR, bottom-up)
  let offset = 54;
  for (let y = h - 1; y >= 0; y--) {
    let rowOffset = offset;
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      view.setUint8(rowOffset++, imageData[idx + 2]); // B
      view.setUint8(rowOffset++, imageData[idx + 1]); // G
      view.setUint8(rowOffset++, imageData[idx]); // R
    }
    offset += rowSize;
  }

  return new Blob([buffer], { type: 'image/bmp' });
}

export interface IcoImage {
  width: number;
  height: number;
  /** Encoded PNG bytes for this size. */
  png: Uint8Array;
}

/**
 * Build an ICO file whose entries embed PNG data (supported since Windows Vista).
 * Layout: ICONDIR (6 bytes) + ICONDIRENTRY (16 bytes each) + image data.
 * Width/height are stored in one byte, so 256 is written as 0; larger sizes are invalid.
 */
export function buildIco(images: IcoImage[]): Uint8Array {
  if (images.length === 0) throw new Error('ICO 至少需要一个尺寸');
  for (const { width, height } of images) {
    if (width < 1 || height < 1 || width > 256 || height > 256) {
      throw new Error(`ICO 图标尺寸必须在 1-256 之间(当前 ${width}×${height})`);
    }
  }

  const headerSize = 6;
  const dirEntrySize = 16;
  const dirSize = images.length * dirEntrySize;
  const totalSize = headerSize + dirSize + images.reduce((s, p) => s + p.png.byteLength, 0);
  const out = new Uint8Array(totalSize);
  const view = new DataView(out.buffer);

  // ICONDIR
  view.setUint16(0, 0, true); // reserved
  view.setUint16(2, 1, true); // type: 1 = icon
  view.setUint16(4, images.length, true); // image count

  let offset = headerSize + dirSize;
  images.forEach(({ width, height, png }, i) => {
    const entry = headerSize + i * dirEntrySize;
    view.setUint8(entry, width >= 256 ? 0 : width);
    view.setUint8(entry + 1, height >= 256 ? 0 : height);
    view.setUint8(entry + 2, 0); // palette colours (0 = no palette)
    view.setUint8(entry + 3, 0); // reserved
    view.setUint16(entry + 4, 1, true); // colour planes
    view.setUint16(entry + 6, 32, true); // bits per pixel
    view.setUint32(entry + 8, png.byteLength, true); // data size
    view.setUint32(entry + 12, offset, true); // data offset from file start
    out.set(png, offset);
    offset += png.byteLength;
  });

  return out;
}

// ICO:含多个尺寸(每个尺寸内嵌 PNG)
export async function canvasesToIcoBlob(entries: { canvas: HTMLCanvasElement; size?: number }[]): Promise<Blob> {
  const images = await Promise.all(
    entries.map(async ({ canvas }) => ({
      width: canvas.width,
      height: canvas.height,
      png: new Uint8Array(await (await canvasToPngBlob(canvas)).arrayBuffer()),
    })),
  );
  return new Blob([buildIco(images)], { type: 'image/x-icon' });
}

// 单尺寸 ICO
export async function canvasToIcoBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return canvasesToIcoBlob([{ canvas, size: canvas.width }]);
}

// 拖动对比用:原图/压缩图 dataURL
export async function canvasToDataUrl(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<string> {
  return canvas.toDataURL(type, quality);
}

// 统一使用 utils/convert 中的实现,避免多处格式不一致
export { formatBytes } from './convert';
