import { afterEach, describe, expect, it, vi } from 'vitest';
import { copyToClipboard } from './clipboard';

function setSecureContext(value: boolean) {
  Object.defineProperty(window, 'isSecureContext', { value, configurable: true });
}

describe('copyToClipboard', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
  });

  it('uses the async clipboard API in secure contexts', async () => {
    setSecureContext(true);
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });

    expect(await copyToClipboard('hello')).toBe(true);
    expect(writeText).toHaveBeenCalledWith('hello');
  });

  it('falls back to execCommand when the clipboard API is missing (plain HTTP)', async () => {
    setSecureContext(false);
    const execCommand = vi.fn().mockReturnValue(true);
    document.execCommand = execCommand;

    expect(await copyToClipboard('hello')).toBe(true);
    expect(execCommand).toHaveBeenCalledWith('copy');
    expect(document.querySelectorAll('textarea')).toHaveLength(0);
  });

  it('falls back when writeText is rejected', async () => {
    setSecureContext(true);
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    document.execCommand = vi.fn().mockReturnValue(true);

    expect(await copyToClipboard('hello')).toBe(true);
  });

  it('reports failure instead of pretending to succeed', async () => {
    setSecureContext(false);
    document.execCommand = vi.fn().mockReturnValue(false);
    expect(await copyToClipboard('hello')).toBe(false);

    document.execCommand = vi.fn(() => {
      throw new Error('not supported');
    });
    expect(await copyToClipboard('hello')).toBe(false);
  });
});
