// Image helpers shared by image-compressor / image-converter / image-to-ico / image-crop.

export { formatBytes } from '@/utils/image-encode';
export { downloadAllZip, downloadBlob, dedupeFileNames } from './file-helpers';

export const SUPPORTED_IMAGE_RE = /image\/(jpeg|png|gif|bmp|webp)|\.(jpe?g|png|gif|bmp|webp)$/i;

export function isSupportedImage(file: File): boolean {
  return SUPPORTED_IMAGE_RE.test(`${file.type} ${file.name}`);
}

/** Decode an image file. The temporary object URL is always revoked. */
export async function loadImage(file: Blob): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('图片加载失败,文件可能已损坏或格式不受支持'));
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('图片编码失败'))), type, quality);
  });
}

const MIME_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/bmp': 'bmp',
  'image/gif': 'gif',
  'image/x-icon': 'ico',
  'image/vnd.microsoft.icon': 'ico',
};

/** File extension for an encoded blob type (e.g. browsers without WebP encoding return PNG). */
export function extForMime(type: string, fallback = 'png'): string {
  return MIME_EXT[type] ?? fallback;
}

export function replaceExtension(name: string, ext: string): string {
  return `${name.replace(/\.[^./\\]+$/, '') || 'image'}.${ext}`;
}

export interface Rect {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

/** Centered source rectangle that covers a `dstW`×`dstH` target without distortion. */
export function coverCropRect(srcW: number, srcH: number, dstW: number, dstH: number): Rect {
  const target = dstW / dstH;
  if (srcW / srcH > target) {
    const sw = srcH * target;
    return { sx: (srcW - sw) / 2, sy: 0, sw, sh: srcH };
  }
  const sh = srcW / target;
  return { sx: 0, sy: (srcH - sh) / 2, sw: srcW, sh };
}

/** Largest size with the source aspect ratio that fits in `maxW`×`maxH`. */
export function containSize(srcW: number, srcH: number, maxW: number, maxH: number): { w: number; h: number } {
  const ratio = Math.min(maxW / srcW, maxH / srcH);
  return { w: Math.max(1, Math.round(srcW * ratio)), h: Math.max(1, Math.round(srcH * ratio)) };
}

/** Scale `w`×`h` down so the longer side is at most `max` (never upscales). */
export function fitWithin(w: number, h: number, max: number): { w: number; h: number } {
  const scale = Math.min(1, max / Math.max(w, h));
  return { w: Math.max(1, Math.round(w * scale)), h: Math.max(1, Math.round(h * scale)) };
}
