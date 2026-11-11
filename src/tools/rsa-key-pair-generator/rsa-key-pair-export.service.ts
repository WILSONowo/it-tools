// 与密钥生成分开放置:生成逻辑依赖 node-forge 的 Web Worker 脚本,这里的纯函数便于单元测试
export const INSECURE_KEY_BITS = 2048;

export function isInsecureKeySize(bits: number): boolean {
  return bits < INSECURE_KEY_BITS;
}

export function pemToHex(pem: string): string {
  const body = pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  const bytes = atob(body);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) hex += bytes.charCodeAt(i).toString(16).padStart(2, '0');
  return hex;
}

/** 打包为 zip:PEM 格式输出 .pem 文件,HEX 格式输出 DER 的十六进制文本 */
export async function buildKeyPairZip({
  publicKey,
  privateKey,
  format,
}: {
  publicKey: string;
  privateKey: string;
  format: 'PEM' | 'HEX';
}): Promise<Blob> {
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();
  const ext = format === 'PEM' ? 'pem' : 'hex.txt';
  zip.file(`rsa_public.${ext}`, publicKey);
  zip.file(`rsa_private.${ext}`, privateKey);
  return zip.generateAsync({ type: 'blob' });
}
