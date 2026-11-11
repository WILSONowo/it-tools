import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let ffmpegInstance: FFmpeg | null = null;
let loadPromise: Promise<FFmpeg> | null = null;

// Keep the tail of ffmpeg's log so failures can explain themselves.
const LOG_LIMIT = 30;
const recentLogs: string[] = [];

export async function getFFmpeg(): Promise<FFmpeg> {
  if (ffmpegInstance) return ffmpegInstance;
  if (loadPromise) return loadPromise;

  const ffmpeg = new FFmpeg();
  ffmpeg.on('log', ({ message }) => {
    recentLogs.push(message);
    if (recentLogs.length > LOG_LIMIT) recentLogs.shift();
  });

  loadPromise = (async () => {
    const base = import.meta.env.BASE_URL || '/';
    await ffmpeg.load({
      classWorkerURL: new URL(`${base}ffmpeg/worker/worker.js`, window.location.href).href,
      coreURL: await toBlobURL(`${base}ffmpeg/core/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${base}ffmpeg/core/ffmpeg-core.wasm`, 'application/wasm'),
    });
    ffmpegInstance = ffmpeg;
    return ffmpeg;
  })();

  try {
    return await loadPromise;
  } catch (e) {
    // Do not cache a failed load: let the next attempt retry from scratch.
    loadPromise = null;
    try {
      ffmpeg.terminate();
    } catch {
      // ignore
    }
    throw new Error(`FFmpeg 引擎加载失败,请检查网络后重试(${errorText(e)})`);
  }
}

function errorText(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === 'string') return e;
  return String(e);
}

/** Clear the log buffer before a run so the error only shows this run's output. */
export function resetFFmpegLog() {
  recentLogs.length = 0;
}

/** Throw a readable error when ffmpeg exits with a non-zero code. */
export function assertFFmpegExit(code: number) {
  if (code === 0) return;
  const tail = recentLogs
    .filter((line) => line.trim() !== '' && !line.startsWith('Aborted'))
    .slice(-5)
    .join('\n');
  throw new Error(`FFmpeg 处理失败(退出码 ${code})${tail ? `:\n${tail}` : ''}`);
}

/**
 * The ffmpeg worker rejects with plain strings, not Error objects,
 * so `(e as Error).message` is undefined. Always go through this helper.
 */
export function ffmpegErrorMessage(e: unknown, fallback = '处理失败,请检查文件格式或参数后重试'): string {
  const text = errorText(e).trim();
  return text && text !== 'undefined' ? text : fallback;
}

async function safeDelete(ffmpeg: FFmpeg, name: string) {
  try {
    await ffmpeg.deleteFile(name);
  } catch {
    // the file may not exist (e.g. ffmpeg failed before writing output)
  }
}

export async function execFFmpeg(
  args: string[],
  inputFiles: { name: string; data: Uint8Array }[],
  outputName: string,
  onProgress?: (percent: number) => void,
): Promise<Uint8Array> {
  const ffmpeg = await getFFmpeg();
  const progressHandler = ({ progress }: { progress: number }) => {
    onProgress?.(Math.round(Math.max(0, Math.min(1, progress || 0)) * 100));
  };
  ffmpeg.on('progress', progressHandler);
  resetFFmpegLog();

  try {
    for (const f of inputFiles) {
      await ffmpeg.writeFile(f.name, f.data);
    }
    assertFFmpegExit(await ffmpeg.exec(args));
    return (await ffmpeg.readFile(outputName)) as Uint8Array;
  } finally {
    ffmpeg.off('progress', progressHandler);
    // Always free MEMFS: inputs can be hundreds of MB.
    for (const f of inputFiles) {
      await safeDelete(ffmpeg, f.name);
    }
    await safeDelete(ffmpeg, outputName);
  }
}

export function extOf(name: string): string {
  const m = name.toLowerCase().match(/\.([a-z0-9]+)$/);
  return m ? m[1] : '';
}

export function mimeOf(ext: string): string {
  const map: Record<string, string> = {
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    m4a: 'audio/mp4',
    aac: 'audio/aac',
    ogg: 'audio/ogg',
    opus: 'audio/ogg',
    flac: 'audio/flac',
    wma: 'audio/x-ms-wma',
    aiff: 'audio/aiff',
    mp4: 'video/mp4',
    webm: 'video/webm',
    mkv: 'video/x-matroska',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
    ts: 'video/mp2t',
    gif: 'image/gif',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
  };
  return map[ext] || 'application/octet-stream';
}
