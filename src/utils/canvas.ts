/** 2D context of a canvas, with a clear error instead of a null crash when it is unavailable. */
export function get2dContext(
  canvas: HTMLCanvasElement,
  options?: CanvasRenderingContext2DSettings,
): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d', options) as CanvasRenderingContext2D | null;
  if (!ctx) {
    throw new Error('当前浏览器无法创建 Canvas 2D 上下文');
  }
  return ctx;
}
