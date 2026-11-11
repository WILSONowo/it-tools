import { expect, test } from '@playwright/test';

test('Converts a generated PCM wave to MP3 locally', async ({ page }) => {
  const wave = Buffer.alloc(44 + 1600);
  wave.write('RIFF');
  wave.writeUInt32LE(wave.length - 8, 4);
  wave.write('WAVEfmt ', 8);
  wave.writeUInt32LE(16, 16);
  wave.writeUInt16LE(1, 20);
  wave.writeUInt16LE(1, 22);
  wave.writeUInt32LE(8000, 24);
  wave.writeUInt32LE(16000, 28);
  wave.writeUInt16LE(2, 32);
  wave.writeUInt16LE(16, 34);
  wave.write('data', 36);
  wave.writeUInt32LE(wave.length - 44, 40);

  await page.goto('/audio-converter');
  await page.locator('input[type=file]').setInputFiles({ name: 'sample.wav', mimeType: 'audio/wav', buffer: wave });
  await page.getByRole('button', { name: '开始转换' }).click();
  const result = page.getByRole('button', { name: '下载', exact: true });
  await expect(result).toBeVisible({ timeout: 30000 });
  const download = page.waitForEvent('download');
  await result.click();
  expect((await download).suggestedFilename()).toMatch(/\.mp3$/);
});
