import { type RegexRunRequest, type RegexRunResult, runRegex } from './regex-tester.service';

export const REGEX_TIMEOUT_MS = 1000;
export const REGEX_TIMEOUT_MESSAGE = '匹配超时,可能存在灾难性回溯';

/**
 * Runs regexes in a dedicated Web Worker. A run that exceeds the timeout terminates
 * the worker (the only way to stop a backtracking regex) and a fresh one is created.
 * Only the latest request matters: a new run supersedes any pending one.
 */
export function createRegexRunner({ timeout = REGEX_TIMEOUT_MS }: { timeout?: number } = {}) {
  let worker: Worker | null = null;
  let seq = 0;
  let pending: {
    id: number;
    timer: ReturnType<typeof setTimeout>;
    resolve: (r: RegexRunResult | null) => void;
  } | null = null;

  function getWorker() {
    if (!worker) {
      worker = new Worker(new URL('./regex.worker.ts', import.meta.url), { type: 'module' });
      worker.addEventListener('message', (event: MessageEvent<{ id: number; result: RegexRunResult }>) => {
        if (!pending || event.data.id !== pending.id) return;
        clearTimeout(pending.timer);
        pending.resolve(event.data.result);
        pending = null;
      });
    }
    return worker;
  }

  function reset() {
    worker?.terminate();
    worker = null;
  }

  function run(request: RegexRunRequest): Promise<RegexRunResult | null> {
    if (typeof Worker === 'undefined') return Promise.resolve(runRegex(request));

    if (pending) {
      // The previous run is obsolete. If it is still busy, it may be stuck backtracking.
      clearTimeout(pending.timer);
      pending.resolve(null);
      pending = null;
      reset();
    }

    const id = ++seq;
    return new Promise<RegexRunResult | null>((resolve) => {
      const timer = setTimeout(() => {
        if (pending?.id !== id) return;
        pending = null;
        reset();
        resolve({ error: REGEX_TIMEOUT_MESSAGE, matches: [], replaced: '' });
      }, timeout);
      pending = { id, timer, resolve };
      try {
        getWorker().postMessage({ id, request });
      } catch (e) {
        clearTimeout(timer);
        pending = null;
        resolve({ error: `无法启动匹配线程:${(e as Error).message}`, matches: [], replaced: '' });
      }
    });
  }

  function dispose() {
    if (pending) {
      clearTimeout(pending.timer);
      pending = null;
    }
    reset();
  }

  return { run, dispose };
}
