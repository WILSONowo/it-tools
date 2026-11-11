// Pure helpers shared by the ffmpeg based tools (no DOM, no ffmpeg).

export const audioFormatOptions = [
  { label: 'MP3', value: 'mp3' },
  { label: 'WAV', value: 'wav' },
  { label: 'M4A (AAC)', value: 'm4a' },
  { label: 'FLAC', value: 'flac' },
  { label: 'OGG', value: 'ogg' },
  { label: 'AAC', value: 'aac' },
  { label: 'Opus', value: 'opus' },
  { label: 'WMA', value: 'wma' },
  { label: 'AIFF', value: 'aiff' },
];

export const audioBitrateOptions = ['128k', '192k', '256k', '320k'].map((b) => ({ label: b, value: b }));

export const audioChannelOptions = [
  { label: '立体声', value: '2' },
  { label: '单声道', value: '1' },
];

const AUDIO_ENCODERS: Record<string, string> = {
  mp3: 'libmp3lame',
  m4a: 'aac',
  ogg: 'libvorbis',
  opus: 'libopus',
  wma: 'wmav2',
  flac: 'flac',
  wav: 'pcm_s16le',
  aiff: 'pcm_s16be',
  aac: 'aac',
};

export function audioEncoderFor(fmt: string): string {
  return AUDIO_ENCODERS[fmt] || 'libmp3lame';
}

/** Lossless / PCM formats ignore the bitrate setting. */
export function isLosslessAudioFormat(fmt: string): boolean {
  return fmt === 'wav' || fmt === 'aiff' || fmt === 'flac';
}

/** ffmpeg arguments that encode the first audio stream to `fmt`. */
export function audioEncodeArgs(fmt: string, bitrate: string, channels: string): string[] {
  const args = ['-map', '0:a:0', '-c:a', audioEncoderFor(fmt)];
  if (!isLosslessAudioFormat(fmt)) args.push('-b:a', bitrate);
  args.push('-ac', channels);
  if (fmt === 'm4a') args.push('-movflags', '+faststart');
  return args;
}

/** Parse `HH:mm:ss(.SSS)` into seconds; empty string → null; invalid → NaN. */
export function parseTimecode(t: string): number | null {
  const s = t.trim();
  if (s === '') return null;
  const m = s.match(/^(\d+):(\d{1,2}):(\d{1,2})(?:\.(\d{1,3}))?$/);
  if (!m) return Number.NaN;
  const minutes = Number(m[2]);
  const seconds = Number(m[3]);
  if (minutes > 59 || seconds > 59) return Number.NaN;
  const ms = m[4] ? Number(m[4].padEnd(3, '0')) : 0;
  return Number(m[1]) * 3600 + minutes * 60 + seconds + ms / 1000;
}

export function baseName(name: string): string {
  return name.replace(/\.[^./\\]+$/, '') || 'output';
}

/**
 * Output file name `<base><suffix>.<ext>`. When that equals the input name
 * (e.g. converting input.wav to wav) a `-converted` suffix is added so the
 * download never looks like the original file.
 */
export function outputFileName(inputName: string, ext: string, suffix = ''): string {
  const name = `${baseName(inputName)}${suffix}.${ext}`;
  if (name.toLowerCase() === inputName.toLowerCase()) return `${baseName(inputName)}${suffix}-converted.${ext}`;
  return name;
}
