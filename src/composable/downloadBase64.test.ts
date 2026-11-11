import { describe, expect, it } from 'vitest';
import { toDataUrl } from './downloadBase64';

describe('downloadBase64', () => {
  it('keeps data URLs untouched', () => {
    expect(toDataUrl('data:image/png;base64,iVBORw0KGgo=')).toBe('data:image/png;base64,iVBORw0KGgo=');
  });

  it('prefixes plain base64 so it is not resolved as a relative URL', () => {
    expect(toDataUrl('SGVsbG8=')).toBe('data:application/octet-stream;base64,SGVsbG8=');
    expect(toDataUrl('  SGVs\nbG8=  ')).toBe('data:application/octet-stream;base64,SGVsbG8=');
  });
});
