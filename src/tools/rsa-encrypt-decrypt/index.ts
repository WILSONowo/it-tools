import { LockAccess } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'RSA 加密 / 解密 / 签名',
  path: '/rsa-encrypt-decrypt',
  description: '使用 RSA 密钥(PEM)进行加密、解密、签名与验签,支持 PKCS#1 v1.5 与 OAEP。',
  keywords: [
    'rsa',
    'encrypt',
    'decrypt',
    'sign',
    'verify',
    'signature',
    'oaep',
    'pkcs',
    'pem',
    'public',
    'private',
    'key',
  ],
  explain: [
    '- RSA 是公钥加密:公钥加密,私钥解密;私钥签名,公钥验签。',
    '- RSA 有长度限制:2048 位密钥最多加密约 245 字节,长数据应使用混合加密。',
  ],
  component: () => import('./rsa-encrypt-decrypt.vue'),
  icon: LockAccess,
  createdAt: new Date('2026-09-03'),
});
