import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Minimal stand-in for the ffmpeg.wasm worker API.
const instances: FakeFFmpeg[] = [];
class FakeFFmpeg {
  files = new Map<string, Uint8Array>();
  terminated = false;
  execCalls: string[][] = [];
  pending: Array<(e: unknown) => void> = [];
  execGate: Promise<void> | null = null;
  constructor() {
    instances.push(this);
  }

  on() {
    // events are not simulated
  }

  off() {
    // events are not simulated
  }
  async load() {
    if (this.terminated) throw new Error('called FFmpeg.terminate()');
  }

  terminate() {
    this.terminated = true;
    this.pending.splice(0).forEach((reject) => reject(new Error('called FFmpeg.terminate()')));
  }

  async writeFile(name: string, data: Uint8Array) {
    this.files.set(name, data);
  }

  async readFile(name: string) {
    const f = this.files.get(name);
    if (!f) throw 'ErrnoError: FS error';
    return f;
  }

  async deleteFile(name: string) {
    this.files.delete(name);
  }

  exec(args: string[]): Promise<number> {
    this.execCalls.push(args);
    return new Promise((resolve, reject) => {
      this.pending.push(reject);
      const finish = () => {
        if (this.terminated) return;
        this.files.set(args[args.length - 1], new Uint8Array([1, 2, 3]));
        resolve(0);
      };
      if (this.execGate) this.execGate.then(finish);
      else finish();
    });
  }
}

vi.mock('@ffmpeg/ffmpeg', () => ({ FFmpeg: FakeFFmpeg }));

function okResponse(type: string) {
  return new Response(new Uint8Array([0]), { status: 200, headers: { 'content-type': type } });
}

const defaultFetch = async (url: string) => okResponse(url.endsWith('.wasm') ? 'application/wasm' : 'text/javascript');
const fetchMock = vi.fn(defaultFetch);

let loader: typeof import('./ffmpeg-loader');

beforeEach(async () => {
  instances.length = 0;
  fetchMock.mockReset();
  fetchMock.mockImplementation(defaultFetch);
  vi.stubGlobal('fetch', fetchMock);
  vi.resetModules();
  loader = await import('./ffmpeg-loader');
});

afterEach(() => {
  loader.cancelFFmpeg();
});

async function simpleJob(signal?: AbortSignal) {
  return loader.runFFmpegJob(
    async (ctx) => {
      const input = await ctx.write('input.wav', new Uint8Array([9]));
      const out = ctx.file('output.mp3');
      await ctx.exec(['-i', input, out]);
      return { input, out, data: await ctx.read(out) };
    },
    { signal },
  );
}

describe('ffmpegErrorMessage', () => {
  it('reads Error objects', () => {
    expect(loader.ffmpegErrorMessage(new Error('boom'))).toBe('boom');
  });

  it('reads plain strings rejected by the ffmpeg worker', () => {
    expect(loader.ffmpegErrorMessage('ErrnoError: FS error')).toBe('ErrnoError: FS error');
  });

  it('falls back when there is nothing useful', () => {
    expect(loader.ffmpegErrorMessage(undefined, 'fallback')).toBe('fallback');
    expect(loader.ffmpegErrorMessage('', 'fallback')).toBe('fallback');
    expect(loader.ffmpegErrorMessage(new Error(''), 'fallback')).toBe('fallback');
  });
});

describe('assertFFmpegExit', () => {
  it('passes on exit code 0', () => {
    expect(() => loader.assertFFmpegExit(0)).not.toThrow();
  });

  it('throws with the exit code otherwise', () => {
    expect(() => loader.assertFFmpegExit(1)).toThrow('退出码 1');
  });
});

describe('runFFmpegJob', () => {
  it('uses unique per-job file names and cleans them up', async () => {
    const a = await simpleJob();
    const b = await simpleJob();
    expect(a.input).toMatch(/^job-\d+-input\.wav$/);
    expect(a.input).not.toBe(b.input);
    expect(a.data).toEqual(new Uint8Array([1, 2, 3]));
    expect(instances).toHaveLength(1);
    expect(instances[0].files.size).toBe(0);
  });

  it('runs jobs one at a time', async () => {
    const order: string[] = [];
    let releaseFirst!: () => void;
    const gate = new Promise<void>((r) => (releaseFirst = r));
    const first = loader.runFFmpegJob(async () => {
      order.push('first:start');
      await gate;
      order.push('first:end');
    });
    const second = loader.runFFmpegJob(async () => {
      order.push('second:start');
    });
    await new Promise((r) => setTimeout(r, 10));
    expect(order).toEqual(['first:start']);
    releaseFirst();
    await Promise.all([first, second]);
    expect(order).toEqual(['first:start', 'first:end', 'second:start']);
  });

  it('cancels a running job and reloads ffmpeg for the next one', async () => {
    await loader.getFFmpeg();
    instances[0].execGate = new Promise<void>(() => undefined); // never finishes on its own
    const ctrl = new AbortController();
    const job = simpleJob(ctrl.signal);
    await new Promise((r) => setTimeout(r, 10));
    ctrl.abort();
    await expect(job).rejects.toBeInstanceOf(loader.FFmpegCancelledError);
    expect(instances[0].terminated).toBe(true);

    const next = await simpleJob();
    expect(next.data).toEqual(new Uint8Array([1, 2, 3]));
    expect(instances).toHaveLength(2);
  });

  it('drops a queued job when aborted without touching the running one', async () => {
    let releaseFirst!: () => void;
    const gate = new Promise<void>((r) => (releaseFirst = r));
    const ran: string[] = [];
    const first = loader.runFFmpegJob(async () => {
      await gate;
      ran.push('first');
    });
    const ctrl = new AbortController();
    const queued = loader.runFFmpegJob(
      async () => {
        ran.push('queued');
      },
      { signal: ctrl.signal },
    );
    const third = loader.runFFmpegJob(async () => {
      ran.push('third');
    });
    ctrl.abort();
    await expect(queued).rejects.toBeInstanceOf(loader.FFmpegCancelledError);
    // The third job must still wait for the first one.
    await new Promise((r) => setTimeout(r, 10));
    expect(ran).toEqual([]);
    releaseFirst();
    await Promise.all([first, third]);
    expect(ran).toEqual(['first', 'third']);
  });

  it('turns a non-zero exit code into a readable error', async () => {
    await loader.getFFmpeg();
    instances[0].exec = async () => 1;
    await expect(simpleJob()).rejects.toThrow('退出码 1');
    expect(instances[0].files.size).toBe(0);
  });
});

describe('getFFmpeg', () => {
  it('explains a missing core file instead of failing cryptically', async () => {
    fetchMock.mockImplementation(async (url: string) =>
      url.endsWith('.wasm')
        ? new Response('<!doctype html>', { status: 200, headers: { 'content-type': 'text/html' } })
        : okResponse('text/javascript'),
    );
    await expect(loader.getFFmpeg()).rejects.toThrow(/ffmpeg-core\.wasm 不存在或无法访问/);
    fetchMock.mockImplementation(async (url: string) =>
      url.endsWith('.wasm') ? new Response('', { status: 404 }) : okResponse('text/javascript'),
    );
    await expect(loader.getFFmpeg()).rejects.toThrow(/HTTP 404/);
  });

  it('revokes the core blob URLs after loading', async () => {
    const revoke = vi.spyOn(URL, 'revokeObjectURL');
    await loader.getFFmpeg();
    expect(revoke).toHaveBeenCalledTimes(2);
    revoke.mockRestore();
  });
});

describe('summarizeFFmpegLog', () => {
  it('keeps error lines and drops the version banner', () => {
    const log = [
      'ffmpeg version 5.1.3 Copyright (c) 2000-2022 the FFmpeg developers',
      '  configuration: --target-os=none',
      '  libavfilter     8. 44.100 /  8. 44.100',
      '  libswscale      6.  7.100 /  6.  7.100',
      'job-2-input.wav: Invalid data found when processing input',
      'Aborted()',
    ];
    expect(loader.summarizeFFmpegLog(log)).toBe('job-2-input.wav: Invalid data found when processing input');
  });

  it('falls back to the last lines when nothing looks like an error', () => {
    expect(loader.summarizeFFmpegLog(['a', 'b', 'c', 'd'])).toBe('b\nc\nd');
  });
});
