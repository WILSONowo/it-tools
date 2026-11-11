import forge from 'node-forge';

const { pki, util } = forge;

// node-forge 没有实现 SHA-224(forge.sha512.sha224 是 SHA-512/224,不是同一种算法),因此不提供该选项
export const signHashes = ['SHA1', 'SHA256', 'SHA384', 'SHA512', 'MD5'] as const;
export type SignHash = (typeof signHashes)[number];
export type SignatureEncoding = 'base64' | 'hex';

export const SIGNATURE_MISMATCH = '签名不匹配';

function createMd(hash: SignHash): forge.md.MessageDigest {
  switch (hash) {
    case 'SHA1':
      return forge.md.sha1.create();
    case 'SHA256':
      return forge.md.sha256.create();
    case 'SHA384':
      return forge.md.sha384.create();
    case 'SHA512':
      return forge.md.sha512.create();
    case 'MD5':
      return forge.md.md5.create();
  }
}

function digestOf(message: string, hash: SignHash): forge.md.MessageDigest {
  const md = createMd(hash);
  md.update(message, 'utf8');
  return md;
}

export function rsaSign({
  privateKeyPem,
  message,
  hash,
  encoding = 'base64',
}: {
  privateKeyPem: string;
  message: string;
  hash: SignHash;
  encoding?: SignatureEncoding;
}): string {
  const key = pki.privateKeyFromPem(privateKeyPem.trim());
  const raw = key.sign(digestOf(message, hash));
  return encoding === 'hex' ? util.bytesToHex(raw) : util.encode64(raw);
}

function decodeSignature(signature: string, encoding: SignatureEncoding): string {
  const compact = signature.replace(/\s+/g, '');
  if (encoding === 'hex') {
    if (!/^(?:[0-9a-fA-F]{2})+$/.test(compact)) {
      throw new Error('签名不是有效的 hex 字符串');
    }
    return util.hexToBytes(compact);
  }
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(compact)) {
    throw new Error('签名不是有效的 base64 字符串');
  }
  return util.decode64(compact);
}

/**
 * 返回 true 表示签名有效,false 表示签名不匹配(包括签名长度错误、填充错误等);
 * 公钥无法解析或签名编码非法时抛出异常。
 */
export function rsaVerify({
  publicKeyPem,
  message,
  signature,
  hash,
  encoding = 'base64',
}: {
  publicKeyPem: string;
  message: string;
  signature: string;
  hash: SignHash;
  encoding?: SignatureEncoding;
}): boolean {
  const key = pki.publicKeyFromPem(publicKeyPem.trim());
  const raw = decodeSignature(signature, encoding);
  try {
    return key.verify(digestOf(message, hash).digest().bytes(), raw);
  } catch (_) {
    // forge 在签名长度不对或解出的 DigestInfo 非法时直接抛错,对用户而言就是签名不匹配
    return false;
  }
}
