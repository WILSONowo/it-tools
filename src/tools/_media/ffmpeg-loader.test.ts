import { describe, expect, it } from 'vitest';
import { assertFFmpegExit, ffmpegErrorMessage } from './ffmpeg-loader';

describe('ffmpegErrorMessage', () => {
  it('reads Error objects', () => {
    expect(ffmpegErrorMessage(new Error('boom'))).toBe('boom');
  });

  it('reads plain strings rejected by the ffmpeg worker', () => {
    expect(ffmpegErrorMessage('ErrnoError: FS error')).toBe('ErrnoError: FS error');
  });

  it('falls back when there is nothing useful', () => {
    expect(ffmpegErrorMessage(undefined, 'fallback')).toBe('fallback');
    expect(ffmpegErrorMessage('', 'fallback')).toBe('fallback');
    expect(ffmpegErrorMessage(new Error(''), 'fallback')).toBe('fallback');
  });
});

describe('assertFFmpegExit', () => {
  it('passes on exit code 0', () => {
    expect(() => assertFFmpegExit(0)).not.toThrow();
  });

  it('throws with the exit code otherwise', () => {
    expect(() => assertFFmpegExit(1)).toThrow('退出码 1');
  });
});
