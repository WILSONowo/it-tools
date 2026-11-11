import forge from 'node-forge';

const { pki, util } = forge;

export function publicKeyFromPem(pem: string) {
  return pki.publicKeyFromPem(pem);
}

export function privateKeyFromPem(pem: string) {
  return pki.privateKeyFromPem(pem);
}

export function encryptRsa(
  publicKey: forge.pki.rsa.PublicKey,
  message: string,
  scheme: 'RSAES-PKCS1-V1_5' | 'RSA-OAEP',
): string {
  const encrypted = publicKey.encrypt(util.encodeUtf8(message), scheme);
  return util.encode64(encrypted);
}

export function decryptRsa(
  privateKey: forge.pki.rsa.PrivateKey,
  ciphertextBase64: string,
  scheme: 'RSAES-PKCS1-V1_5' | 'RSA-OAEP',
): string {
  const bytes = util.decode64(ciphertextBase64);
  const decrypted = privateKey.decrypt(bytes, scheme);
  return util.decodeUtf8(decrypted);
}

export function signRsa(
  privateKey: forge.pki.rsa.PrivateKey,
  message: string,
  hashAlgorithm: 'sha1' | 'sha256' | 'sha384' | 'sha512' | 'md5',
): string {
  const md = forge.md[hashAlgorithm].create();
  md.update(message, 'utf8');
  const signature = privateKey.sign(md);
  return util.encode64(signature);
}

export function verifyRsa(
  publicKey: forge.pki.rsa.PublicKey,
  message: string,
  signatureBase64: string,
  hashAlgorithm: 'sha1' | 'sha256' | 'sha384' | 'sha512' | 'md5',
): boolean {
  try {
    const md = forge.md[hashAlgorithm].create();
    md.update(message, 'utf8');
    const bytes = util.decode64(signatureBase64);
    return publicKey.verify(md.digest().bytes(), bytes);
  } catch {
    return false;
  }
}
