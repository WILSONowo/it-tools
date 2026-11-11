import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let ffmpegInstance: FFmpeg | null = null;
let loadPromise: Promise<FFmpeg> | null = null;

export async function getFFmpeg(onProgress?: (percent: number) => void): Promise<FFmpeg> {
  if (ffmpegInstance) return ffmpegInstance;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const ffmpeg = new FFmpeg();
    if (onProgress) {
      ffmpeg.on('progress', ({ progress }) => {
        onProgress(Math.round(progress * 100));
      });
    }
    ffmpeg.on('log', ({ message }) => {
      // 可在此收集 ffmpeg 输出,默认忽略
      void message;
    });
    const base = import.meta.env.BASE_URL || '/';
    await ffmpeg.load({
      classWorkerURL: new URL(`${base}ffmpeg/worker/worker.js`, window.location.href).href,
      coreURL: await toBlobURL(`${base}ffmpeg/core/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${base}ffmpeg/core/ffmpeg-core.wasm`, 'application/wasm'),
    });
    ffmpegInstance = ffmpeg;
    return ffmpeg;
  })();

  return loadPromise;
}

export async function execFFmpeg(
  args: string[],
  inputFiles: { name: string; data: Uint8Array }[],
  outputName: string,
  onProgress?: (percent: number) => void,
): Promise<Uint8Array> {
  const ffmpeg = await getFFmpeg(onProgress);
  for (const f of inputFiles) {
    await ffmpeg.writeFile(f.name, f.data);
  }
  await ffmpeg.exec(args);
  const data = await ffmpeg.readFile(outputName);
  for (const f of inputFiles) {
    await ffmpeg.deleteFile(f.name);
  }
  await ffmpeg.deleteFile(outputName);
  return data as Uint8Array;
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
