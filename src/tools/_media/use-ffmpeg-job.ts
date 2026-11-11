import { computed, onBeforeUnmount, ref, shallowRef } from 'vue';
import type { UploadFileInfo } from 'naive-ui';
import { useMessage } from 'naive-ui';
import { downloadBlob } from './file-helpers';
import {
  extOf,
  ffmpegErrorMessage,
  isFFmpegCancelled,
  runFFmpegJob,
  type FFmpegJobContext,
  type FFmpegJobStatus,
} from './ffmpeg-loader';

export interface FfmpegJobOutput {
  blob: Blob;
  url: string;
  name: string;
  size: number;
}

export interface FfmpegJobResult {
  data: Uint8Array;
  name: string;
  mime: string;
}

export interface UseFfmpegJobOptions {
  /** Accepted extensions without dot, e.g. ['mp3', 'wav']. */
  extensions: string[];
  /** Human readable kind used in messages, e.g. '音频'. */
  kind: string;
  /** Max input size in bytes (default 2 GB, the practical ffmpeg.wasm limit). */
  maxSize?: number;
  /** Called by reset() so a tool can clear its own fields. */
  onReset?: () => void;
}

const DEFAULT_MAX_SIZE = 2 * 1024 * 1024 * 1024;

/**
 * State shared by the ffmpeg tools: picked file + preview URL, processing flag,
 * progress, error, output Blob URL lifecycle, download and cancel.
 */
export function useFfmpegJob(options: UseFfmpegJobOptions) {
  const message = useMessage();

  const file = shallowRef<File | null>(null);
  const fileUrl = ref('');
  const processing = ref(false);
  const status = ref<FFmpegJobStatus | null>(null);
  const progress = ref(0);
  const error = ref('');
  const output = shallowRef<FfmpegJobOutput | null>(null);

  let controller: AbortController | null = null;
  // Incremented on every run / cancel / reset: results of older jobs are ignored.
  let currentJob = 0;

  const statusText = computed(() => {
    if (!processing.value) return '';
    switch (status.value) {
      case 'queued':
        return '排队中:另一个音视频任务正在处理,完成后自动开始...';
      case 'loading':
        return '正在加载 FFmpeg 引擎(仅首次使用需要,约 30 MB)...';
      default:
        return `处理中...${progress.value}%`;
    }
  });

  function clearOutput() {
    if (output.value) URL.revokeObjectURL(output.value.url);
    output.value = null;
  }

  function setOutput(blob: Blob, name: string) {
    clearOutput();
    output.value = { blob, url: URL.createObjectURL(blob), name, size: blob.size };
  }

  function stopJob() {
    currentJob++;
    controller?.abort();
    controller = null;
    processing.value = false;
    status.value = null;
    progress.value = 0;
  }

  function cancel() {
    if (!processing.value) return;
    stopJob();
    message.info('已取消处理');
  }

  function reset() {
    stopJob();
    file.value = null;
    if (fileUrl.value) URL.revokeObjectURL(fileUrl.value);
    fileUrl.value = '';
    clearOutput();
    error.value = '';
    options.onReset?.();
  }

  function onPick({ file: info }: { file: UploadFileInfo }) {
    const f = info?.file;
    if (!f) return false;
    const ext = extOf(f.name);
    if (!options.extensions.includes(ext)) {
      message.error(`不支持的${options.kind}格式:${ext ? `.${ext}` : f.name}`);
      return false;
    }
    if (f.size === 0) {
      message.error('文件为空');
      return false;
    }
    const maxSize = options.maxSize ?? DEFAULT_MAX_SIZE;
    if (f.size > maxSize) {
      message.error(`文件过大,浏览器内处理最多支持 ${Math.round(maxSize / 1024 / 1024)} MB`);
      return false;
    }
    reset();
    file.value = f;
    fileUrl.value = URL.createObjectURL(f);
    return false;
  }

  /**
   * Run an ffmpeg job for the current file. Results of a job that was
   * cancelled, reset or replaced by a newer one are dropped.
   */
  async function run(
    task: (ctx: FFmpegJobContext, input: File) => Promise<FfmpegJobResult>,
    { successText = '处理完成', fallbackError }: { successText?: string; fallbackError?: string } = {},
  ) {
    const input = file.value;
    if (!input || processing.value) return;
    const jobId = ++currentJob;
    const ctrl = new AbortController();
    controller = ctrl;
    error.value = '';
    clearOutput();
    processing.value = true;
    status.value = 'queued';
    progress.value = 0;
    const isCurrent = () => jobId === currentJob;

    try {
      const res = await runFFmpegJob((ctx) => task(ctx, input), {
        signal: ctrl.signal,
        onStatus: (s) => {
          if (isCurrent()) status.value = s;
        },
        onProgress: (p) => {
          if (isCurrent()) progress.value = p;
        },
      });
      if (!isCurrent()) return;
      setOutput(new Blob([res.data], { type: res.mime }), res.name);
      message.success(successText);
    } catch (e) {
      if (!isCurrent() || isFFmpegCancelled(e)) return;
      error.value = ffmpegErrorMessage(e, fallbackError);
    } finally {
      if (isCurrent()) {
        processing.value = false;
        status.value = null;
        progress.value = 0;
        controller = null;
      }
    }
  }

  function download() {
    if (output.value) downloadBlob(output.value.blob, output.value.name);
  }

  onBeforeUnmount(() => {
    // Cancels a running ffmpeg job and frees every object URL.
    stopJob();
    if (fileUrl.value) URL.revokeObjectURL(fileUrl.value);
    clearOutput();
  });

  return {
    file,
    fileUrl,
    processing,
    status,
    statusText,
    progress,
    error,
    output,
    onPick,
    run,
    cancel,
    reset,
    clearOutput,
    download,
  };
}

export type FfmpegJob = ReturnType<typeof useFfmpegJob>;
