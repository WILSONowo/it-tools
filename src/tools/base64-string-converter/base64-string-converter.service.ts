import { base64ToText, isValidBase64, textToBase64 } from '@/utils/base64';

/** Standard Base64 → URL-safe Base64 (RFC 4648 §5): `+/` → `-_`, padding removed. */
export function toUrlSafeBase64(base64: string) {
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** URL-safe (or unpadded) Base64 → standard padded Base64. Whitespace is removed. */
export function fromUrlSafeBase64(base64: string) {
  const standard = base64.replace(/\s/g, '').replace(/-/g, '+').replace(/_/g, '/').replace(/=+$/, '');
  const padding = (4 - (standard.length % 4)) % 4;
  return standard + '='.repeat(padding);
}

export function encodeBase64(text: string, { urlSafe = false }: { urlSafe?: boolean } = {}) {
  const base64 = textToBase64(text);
  return urlSafe ? toUrlSafeBase64(base64) : base64;
}

function normalizeInput(base64: string, urlSafe: boolean) {
  const trimmed = base64.trim();
  return urlSafe ? fromUrlSafeBase64(trimmed) : trimmed;
}

export function isValidBase64Input(base64: string, { urlSafe = false }: { urlSafe?: boolean } = {}) {
  const normalized = normalizeInput(base64, urlSafe);
  // A length of 4n+1 can never be valid, even once padded
  if (urlSafe && normalized.replace(/=+$/, '').length % 4 === 1) {
    return false;
  }
  return isValidBase64(normalized);
}

export function decodeBase64(base64: string, { urlSafe = false }: { urlSafe?: boolean } = {}) {
  return base64ToText(normalizeInput(base64, urlSafe));
}
