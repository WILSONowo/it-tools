// Download helpers shared by the media and image tools.

/** Download a Blob; the object URL is revoked once the browser has picked it up. */
export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoking synchronously can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/**
 * Make file names unique (case-insensitive, as on Windows / macOS):
 * `a.webp`, `a.webp` → `a.webp`, `a (2).webp`.
 */
export function dedupeFileNames(names: string[]): string[] {
  const used = new Set<string>();
  return names.map((name) => {
    let candidate = name;
    if (used.has(candidate.toLowerCase())) {
      const m = name.match(/^(.*?)(\.[^.]*)?$/);
      const stem = m?.[1] ?? name;
      const ext = m?.[2] ?? '';
      let n = 2;
      do {
        candidate = `${stem} (${n})${ext}`;
        n++;
      } while (used.has(candidate.toLowerCase()));
    }
    used.add(candidate.toLowerCase());
    return candidate;
  });
}

/** Put the files into a ZIP (names de-duplicated) and download it. */
export async function downloadAllZip(entries: { name: string; blob: Blob }[], zipName: string, folderName?: string) {
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();
  const folder = folderName ? zip.folder(folderName) ?? zip : zip;
  const names = dedupeFileNames(entries.map((e) => e.name));
  entries.forEach((e, i) => folder.file(names[i], e.blob));
  const blob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(blob, zipName);
}
