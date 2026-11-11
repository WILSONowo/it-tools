import forge from 'node-forge';

const { pki, util } = forge;

export type RsaPadding = 'RSAES-PKCS1-V1_5' | 'RSA-OAEP';
export type OaepHash = 'SHA1' | 'SHA256' | 'SHA384' | 'SHA512';
export type CipherEncoding = 'base64' | 'hex';

export const oaepHashes: OaepHash[] = ['SHA1', 'SHA256', 'SHA384', 'SHA512'];

function createMd(hash: OaepHash): forge.md.MessageDigest {
  switch (hash) {
    case 'SHA1':
      return forge.md.sha1.create();
    case 'SHA256':
      return forge.md.sha256.create();
    case 'SHA384':
      return forge.md.sha384.create();
    case 'SHA512':
      return forge.md.sha512.create();
  }
}

// OAEP 的标签哈希与 MGF1 哈希保持一致,与 OpenSSL / Node.js `oaepHash` / WebCrypto 的默认行为相同
function schemeOptions(padding: RsaPadding, hash: OaepHash) {
  if (padding !== 'RSA-OAEP') {
    return undefined;
  }
  return { md: createMd(hash), mgf1: { md: createMd(hash) } };
}

export function parsePublicKey(pem: string): forge.pki.rsa.PublicKey {
  const text = pem.trim();
  if (!text.startsWith('-----BEGIN')) {
    throw new Error('当前仅支持 PEM 格式密钥');
  }
  return pki.publicKeyFromPem(text);
}

export function parsePrivateKey(pem: string): forge.pki.rsa.PrivateKey {
  const text = pem.trim();
  if (!text.startsWith('-----BEGIN')) {
    throw new Error('当前仅支持 PEM 格式密钥');
  }
  return pki.privateKeyFromPem(text);
}

export function rsaEncrypt({
  publicKeyPem,
  plainText,
  padding,
  oaepHash = 'SHA256',
  encoding = 'base64',
}: {
  publicKeyPem: string;
  plainText: string;
  padding: RsaPadding;
  oaepHash?: OaepHash;
  encoding?: CipherEncoding;
}): string {
  const key = parsePublicKey(publicKeyPem);
  const bytes = key.encrypt(util.encodeUtf8(plainText), padding, schemeOptions(padding, oaepHash));
  return encoding === 'hex' ? util.bytesToHex(bytes) : util.encode64(bytes);
}

export function rsaDecrypt({
  privateKeyPem,
  cipherText,
  padding,
  oaepHash = 'SHA256',
  encoding = 'base64',
}: {
  privateKeyPem: string;
  cipherText: string;
  padding: RsaPadding;
  oaepHash?: OaepHash;
  encoding?: CipherEncoding;
}): string {
  const key = parsePrivateKey(privateKeyPem);
  const compact = cipherText.replace(/\s+/g, '');
  let cipherBytes: string;
  if (encoding === 'hex') {
    if (!/^(?:[0-9a-fA-F]{2})+$/.test(compact)) {
      throw new Error('密文不是有效的 hex 字符串');
    }
    cipherBytes = util.hexToBytes(compact);
  } else {
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(compact)) {
      throw new Error('密文不是有效的 base64 字符串');
    }
    cipherBytes = util.decode64(compact);
  }
  let bytes: string;
  try {
    bytes = key.decrypt(cipherBytes, padding, schemeOptions(padding, oaepHash));
  } catch (_) {
    throw new Error('解密失败:私钥、填充方式或 OAEP 哈希与加密时不一致,或密文已损坏');
  }
  try {
    return util.decodeUtf8(bytes);
  } catch (_) {
    throw new Error('解密成功,但结果不是有效的 UTF-8 文本');
  }
}
