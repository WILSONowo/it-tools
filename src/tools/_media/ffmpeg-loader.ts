import { FFmpeg } from '@ffmpeg/ffmpeg';

// One ffmpeg.wasm instance is shared by every media tool. Jobs are serialized
// through a promise queue, each job gets unique virtual file names, and a
// running job can be cancelled by terminating the worker (the next job reloads).

let ffmpegInstance: FFmpeg | null = null;
let loading: { ffmpeg: FFmpeg; promise: Promise<FFmpeg> } | null = null;
// Bumped on every cancel so an in-flight load knows it has been abandoned.
let generation = 0;

// Keep the tail of ffmpeg's log so failures can explain themselves.
const LOG_LIMIT = 30;
const recentLogs: string[] = [];

export class FFmpegCancelledError extends Error {
  constructor() {
    super('已取消');
    this.name = 'FFmpegCancelledError';
  }
}

export function isFFmpegCancelled(e: unknown): e is FFmpegCancelledError {
  return e instanceof FFmpegCancelledError;
}

function errorText(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === 'string') return e;
  return String(e);
}

function assetURL(path: string): string {
  const base = import.meta.env.BASE_URL || '/';
  return new URL(`${base}${path}`, window.location.href).href;
}

/**
 * Fetch an ffmpeg asset and make sure it is really there: a missing file on an
 * SPA host usually comes back as index.html with status 200.
 */
async function fetchAsset(path: string): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(assetURL(path));
  } catch (e) {
    throw new Error(`无法下载 FFmpeg 引擎文件 ${path},请检查网络后重试(${errorText(e)})`);
  }
  const type = res.headers.get('content-type') || '';
  if (!res.ok || type.includes('text/html')) {
    throw new Error(
      `FFmpeg 引擎文件 ${path} 不存在或无法访问(HTTP ${res.status}),请确认站点已部署 public/ffmpeg 目录后刷新重试`,
    );
  }
  return res;
}

async function fetchBlobURL(path: string, mimeType: string): Promise<string> {
  const res = await fetchAsset(path);
  const buf = await res.arrayBuffer();
  return URL.createObjectURL(new Blob([buf], { type: mimeType }));
}

function safeTerminate(ffmpeg: FFmpeg) {
  try {
    ffmpeg.terminate();
  } catch {
    // ignore
  }
}

function clearLoading(ffmpeg: FFmpeg) {
  if (loading?.ffmpeg === ffmpeg) loading = null;
}

export function getFFmpeg(): Promise<FFmpeg> {
  if (ffmpegInstance) return Promise.resolve(ffmpegInstance);
  if (loading) return loading.promise;

  const gen = generation;
  const ffmpeg = new FFmpeg();
  ffmpeg.on('log', ({ message }) => {
    recentLogs.push(message);
    if (recentLogs.length > LOG_LIMIT) recentLogs.shift();
  });

  const promise = (async () => {
    const blobURLs: string[] = [];
    const checkCancelled = () => {
      if (gen !== generation) throw new FFmpegCancelledError();
    };
    try {
      // The worker is loaded by URL, so only check that it exists.
      await fetchAsset('ffmpeg/worker/worker.js');
      checkCancelled();
      const coreURL = await fetchBlobURL('ffmpeg/core/ffmpeg-core.js', 'text/javascript');
      blobURLs.push(coreURL);
      checkCancelled();
      const wasmURL = await fetchBlobURL('ffmpeg/core/ffmpeg-core.wasm', 'application/wasm');
      blobURLs.push(wasmURL);
      checkCancelled();
      await ffmpeg.load({ classWorkerURL: assetURL('ffmpeg/worker/worker.js'), coreURL, wasmURL });
      checkCancelled();
    } catch (e) {
      // Do not cache a failed load: let the next attempt retry from scratch.
      safeTerminate(ffmpeg);
      if (gen !== generation || isFFmpegCancelled(e)) throw new FFmpegCancelledError();
      const text = errorText(e);
      throw new Error(
        text.startsWith('FFmpeg') || text.startsWith('无法') ? text : `FFmpeg 引擎加载失败,请检查网络后重试(${text})`,
      );
    } finally {
      clearLoading(ffmpeg);
      // The core is already instantiated inside the worker; the copies are no longer needed.
      blobURLs.forEach((u) => URL.revokeObjectURL(u));
    }
    ffmpegInstance = ffmpeg;
    return ffmpeg;
  })();

  loading = { ffmpeg, promise };
  return promise;
}

/**
 * Stop whatever ffmpeg is doing right now (loading or running) and drop the
 * instance. Pending calls reject; the next job loads a fresh worker.
 */
export function cancelFFmpeg() {
  generation++;
  if (ffmpegInstance) {
    safeTerminate(ffmpegInstance);
    ffmpegInstance = null;
  }
  if (loading) {
    safeTerminate(loading.ffmpeg);
    loading = null;
  }
}

/** Clear the log buffer before a run so the error only shows this run's output. */
export function resetFFmpegLog() {
  recentLogs.length = 0;
}

/** Throw a readable error when ffmpeg exits with a non-zero code. */
// Banner lines ffmpeg prints on every run (version, build configuration, library versions).
const FFMPEG_BANNER_LINE = /^\s*(ffmpeg version|built with|configuration:|lib(av|sw|post)\w*\s+\d)/;
const FFMPEG_ERROR_LINE = /error|invalid|failed|not found|no such|unsupported|unknown|could not|cannot|unable/i;

/** Pick the lines of an ffmpeg log that explain a failure, skipping the version banner. */
export function summarizeFFmpegLog(lines: string[]): string {
  const useful = lines.filter(
    (line) => line.trim() !== '' && !line.startsWith('Aborted') && !FFMPEG_BANNER_LINE.test(line),
  );
  const errors = useful.filter((line) => FFMPEG_ERROR_LINE.test(line));
  return (errors.length > 0 ? errors : useful).slice(-3).join('\n');
}

export function assertFFmpegExit(code: number) {
  if (code === 0) return;
  const tail = summarizeFFmpegLog(recentLogs);
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

export type FFmpegJobStatus = 'queued' | 'loading' | 'running';

export interface FFmpegJobContext {
  /** Unique job number (also used in the virtual file names). */
  id: number;
  ffmpeg: FFmpeg;
  /** Unique virtual file name for this job, e.g. `job-3-input.mp4`. Deleted when the job ends. */
  file: (name: string) => string;
  /** Write data to a unique virtual file and return its name. */
  write: (name: string, data: Uint8Array) => Promise<string>;
  /** Run ffmpeg and throw a readable error on a non-zero exit code. */
  exec: (args: string[]) => Promise<void>;
  read: (fullName: string) => Promise<Uint8Array>;
}

export interface FFmpegJobOptions {
  signal?: AbortSignal;
  onProgress?: (percent: number) => void;
  onStatus?: (status: FFmpegJobStatus) => void;
}

let queueTail: Promise<void> = Promise.resolve();
let jobSeq = 0;

function waitTurn(prev: Promise<void>, signal?: AbortSignal): Promise<void> {
  if (!signal) return prev;
  if (signal.aborted) return Promise.reject(new FFmpegCancelledError());
  return new Promise<void>((resolve, reject) => {
    const onAbort = () => reject(new FFmpegCancelledError());
    signal.addEventListener('abort', onAbort, { once: true });
    prev.then(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    });
  });
}

/**
 * Run a job on the shared ffmpeg instance. Jobs run one at a time; aborting
 * `signal` removes a queued job or terminates the running one.
 */
export async function runFFmpegJob<T>(
  task: (ctx: FFmpegJobContext) => Promise<T>,
  { signal, onProgress, onStatus }: FFmpegJobOptions = {},
): Promise<T> {
  const id = ++jobSeq;
  const prev = queueTail;
  let release!: () => void;
  queueTail = new Promise<void>((resolve) => {
    release = resolve;
  });

  let ffmpeg: FFmpeg | null = null;
  const files = new Set<string>();
  const progressHandler = ({ progress }: { progress: number }) => {
    onProgress?.(Math.round(Math.max(0, Math.min(1, progress || 0)) * 100));
  };
  const onAbort = () => cancelFFmpeg();

  try {
    onStatus?.('queued');
    await waitTurn(prev, signal);
    if (signal?.aborted) throw new FFmpegCancelledError();
    signal?.addEventListener('abort', onAbort, { once: true });

    if (!ffmpegInstance) onStatus?.('loading');
    ffmpeg = await getFFmpeg();
    if (signal?.aborted) throw new FFmpegCancelledError();
    onStatus?.('running');
    ffmpeg.on('progress', progressHandler);
    resetFFmpegLog();

    const instance = ffmpeg;
    const ctx: FFmpegJobContext = {
      id,
      ffmpeg: instance,
      file: (name) => {
        const full = `job-${id}-${name}`;
        files.add(full);
        return full;
      },
      write: async (name, data) => {
        const full = ctx.file(name);
        await instance.writeFile(full, data);
        return full;
      },
      exec: async (args) => assertFFmpegExit(await instance.exec(args)),
      read: async (fullName) => (await instance.readFile(fullName)) as Uint8Array,
    };
    return await task(ctx);
  } catch (e) {
    // A terminated worker rejects with "called FFmpeg.terminate()".
    if (signal?.aborted || isFFmpegCancelled(e) || (ffmpeg && ffmpeg !== ffmpegInstance)) {
      throw new FFmpegCancelledError();
    }
    throw e;
  } finally {
    signal?.removeEventListener('abort', onAbort);
    if (ffmpeg) {
      ffmpeg.off('progress', progressHandler);
      // Always free MEMFS (inputs can be hundreds of MB) unless the worker is gone anyway.
      if (ffmpeg === ffmpegInstance) {
        for (const f of files) await safeDelete(ffmpeg, f);
      }
    }
    // Let the next job start only after the previous one is really finished,
    // even when this job was aborted while still waiting in the queue.
    void prev.then(release);
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
    mpg: 'video/mpeg',
    '3gp': 'video/3gpp',
    gif: 'image/gif',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
  };
  return map[ext] || 'application/octet-stream';
}
