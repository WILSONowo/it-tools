import { copyFile, mkdir } from 'node:fs/promises';

const directory = new URL('../public/ffmpeg/core/', import.meta.url);
await mkdir(directory, { recursive: true });
await copyFile(new URL(import.meta.resolve('@ffmpeg/core')), new URL('ffmpeg-core.js', directory));
await copyFile(new URL(import.meta.resolve('@ffmpeg/core/wasm')), new URL('ffmpeg-core.wasm', directory));

// Serve the module worker directly so the dev server does not inject its browser client.
const worker = new URL('../public/ffmpeg/worker/', import.meta.url);
const ffmpeg = import.meta.resolve('@ffmpeg/ffmpeg');
await mkdir(worker, { recursive: true });
for (const file of ['worker.js', 'const.js', 'errors.js']) {
  await copyFile(new URL(file, ffmpeg), new URL(file, worker));
}
