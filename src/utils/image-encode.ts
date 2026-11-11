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
  const ctx = canvas.getContext('2d')!;
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

// ICO:含多个尺寸(每个尺寸内嵌 PNG)
export async function canvasesToIcoBlob(entries: { canvas: HTMLCanvasElement; size: number }[]): Promise<Blob> {
  const pngs = await Promise.all(
    entries.map(async ({ canvas }) => ({ size: canvas.width, png: await canvasToPngBlob(canvas) })),
  );

  const headerSize = 6;
  const dirEntrySize = 16;
  const dirSize = pngs.length * dirEntrySize;
  const totalSize = headerSize + dirSize + pngs.reduce((s, p) => s + p.png.size, 0);
  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);

  // ICONDIR
  view.setUint16(0, 0, true); // reserved
  view.setUint16(2, 1, true); // type icon
  view.setUint16(4, pngs.length, true);

  let offset = headerSize + dirSize;
  for (let i = 0; i < pngs.length; i++) {
    const { size, png } = pngs[i];
    const entry = headerSize + i * dirEntrySize;
    view.setUint8(entry, size >= 256 ? 0 : size);
    view.setUint8(entry + 1, size >= 256 ? 0 : size);
    view.setUint8(entry + 2, 0); // palette
    view.setUint8(entry + 3, 0); // reserved
    view.setUint16(entry + 4, 1, true); // planes
    view.setUint16(entry + 6, 32, true); // bpp
    view.setUint32(entry + 8, png.size, true);
    view.setUint32(entry + 12, offset, true);
    const bytes = new Uint8Array(await png.arrayBuffer());
    new Uint8Array(buffer, offset, bytes.length).set(bytes);
    offset += bytes.length;
  }

  return new Blob([buffer], { type: 'image/x-icon' });
}

// 单尺寸 ICO
export async function canvasToIcoBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return canvasesToIcoBlob([{ canvas, size: canvas.width }]);
}

// 拖动对比用:原图/压缩图 dataURL
export async function canvasToDataUrl(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<string> {
  return canvas.toDataURL(type, quality);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  const units = ['KB', 'MB', 'GB'];
  let v = bytes / 1024;
  let u = 0;
  while (v >= 1024 && u < units.length - 1) {
    v /= 1024;
    u++;
  }
  return v.toFixed(2) + ' ' + units[u];
}
