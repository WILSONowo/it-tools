import { extension as getExtensionFromMime } from 'mime-types';
import type { Ref } from 'vue';

function getFileExtensionFromBase64({
  base64String,
  defaultExtension = 'txt',
}: {
  base64String: string;
  defaultExtension?: string;
}) {
  const hasMimeType = base64String.match(/data:(.*?);base64/i);

  if (hasMimeType) {
    return getExtensionFromMime(hasMimeType[1]) || defaultExtension;
  }

  return defaultExtension;
}

/**
 * Make sure the string can be used as a download href: plain base64 without a `data:` prefix
 * would otherwise be resolved as a relative URL (and download the site itself).
 */
export function toDataUrl(base64String: string, mimeType = 'application/octet-stream') {
  const trimmed = base64String.trim();
  if (/^data:/i.test(trimmed)) {
    return trimmed;
  }
  return `data:${mimeType};base64,${trimmed.replace(/\s/g, '')}`;
}

export function useDownloadFileFromBase64({ source, filename }: { source: Ref<string>; filename?: string }) {
  return {
    download() {
      const base64String = source.value;

      if (base64String === '') {
        throw new Error('Base64 string is empty');
      }

      const cleanFileName = filename ?? `file.${getFileExtensionFromBase64({ base64String })}`;

      const a = document.createElement('a');
      a.href = toDataUrl(base64String);
      a.download = cleanFileName;
      a.click();
    },
  };
}
