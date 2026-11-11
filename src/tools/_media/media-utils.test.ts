import { describe, expect, it } from 'vitest';
import { audioEncodeArgs, audioEncoderFor, outputFileName, parseTimecode } from './media-utils';
import { dedupeFileNames } from './file-helpers';
import { containSize, coverCropRect, extForMime, fitWithin, replaceExtension } from './image-helpers';

describe('parseTimecode', () => {
  it('parses HH:mm:ss(.SSS)', () => {
    expect(parseTimecode('00:00:00.000')).toBe(0);
    expect(parseTimecode('01:02:03.5')).toBeCloseTo(3723.5);
    expect(parseTimecode(' 0:00:30 ')).toBe(30);
  });

  it('returns null for empty and NaN for invalid input', () => {
    expect(parseTimecode('')).toBeNull();
    expect(parseTimecode('abc')).toBeNaN();
    expect(parseTimecode('00:61:00')).toBeNaN();
  });
});

describe('audio encode args', () => {
  it('maps formats to encoders', () => {
    expect(audioEncoderFor('mp3')).toBe('libmp3lame');
    expect(audioEncoderFor('opus')).toBe('libopus');
    expect(audioEncoderFor('unknown')).toBe('libmp3lame');
  });

  it('skips the bitrate for lossless formats', () => {
    expect(audioEncodeArgs('flac', '192k', '2')).not.toContain('-b:a');
    expect(audioEncodeArgs('mp3', '192k', '1')).toEqual([
      '-map',
      '0:a:0',
      '-c:a',
      'libmp3lame',
      '-b:a',
      '192k',
      '-ac',
      '1',
    ]);
    expect(audioEncodeArgs('m4a', '128k', '2')).toContain('+faststart');
  });
});

describe('outputFileName', () => {
  it('replaces the extension', () => {
    expect(outputFileName('song.wav', 'mp3')).toBe('song.mp3');
    expect(outputFileName('song.mp3', 'mp3', '-cut')).toBe('song-cut.mp3');
  });

  it('never returns the input name', () => {
    expect(outputFileName('input.wav', 'wav')).toBe('input-converted.wav');
    expect(outputFileName('Input.WAV', 'wav')).toBe('Input-converted.wav');
  });
});

describe('dedupeFileNames', () => {
  it('numbers duplicates', () => {
    expect(dedupeFileNames(['a.webp', 'a.webp', 'b.webp', 'A.webp'])).toEqual([
      'a.webp',
      'a (2).webp',
      'b.webp',
      'A (3).webp',
    ]);
  });

  it('skips names that are already taken', () => {
    expect(dedupeFileNames(['a (2).png', 'a.png', 'a.png'])).toEqual(['a (2).png', 'a.png', 'a (3).png']);
    expect(dedupeFileNames(['noext', 'noext'])).toEqual(['noext', 'noext (2)']);
  });
});

describe('image geometry', () => {
  it('cover-crops a wide image to a portrait target, centered', () => {
    const r = coverCropRect(1000, 500, 295, 413);
    expect(r.sh).toBe(500);
    expect(r.sw / r.sh).toBeCloseTo(295 / 413);
    expect(r.sx).toBeCloseTo((1000 - r.sw) / 2);
    expect(r.sy).toBe(0);
  });

  it('cover-crops a tall image to a landscape target', () => {
    const r = coverCropRect(500, 1000, 400, 300);
    expect(r.sw).toBe(500);
    expect(r.sw / r.sh).toBeCloseTo(4 / 3);
    expect(r.sy).toBeCloseTo((1000 - r.sh) / 2);
  });

  it('contains and fits sizes', () => {
    expect(containSize(1000, 500, 800, 600)).toEqual({ w: 800, h: 400 });
    expect(fitWithin(4000, 2000, 800)).toEqual({ w: 800, h: 400 });
    expect(fitWithin(300, 200, 800)).toEqual({ w: 300, h: 200 });
  });

  it('maps mime types and file names', () => {
    expect(extForMime('image/webp')).toBe('webp');
    expect(extForMime('image/png')).toBe('png');
    expect(extForMime('', 'jpg')).toBe('jpg');
    expect(replaceExtension('photo.final.jpg', 'webp')).toBe('photo.final.webp');
  });
});
