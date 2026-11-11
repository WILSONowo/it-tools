import { WritingSign } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'RSA 签名 / 验证',
  path: '/rsa-sign-verify',
  description: '使用 RSA 私钥对消息进行签名,并用公钥验证签名(PKCS#1 v1.5,支持多种哈希)。',
  keywords: ['rsa', 'sign', 'verify', 'signature', 'hash', 'pem', 'pkcs', 'public', 'private'],
  component: () => import('./rsa-sign-verify.vue'),
  icon: WritingSign,
  createdAt: new Date('2026-09-03'),
});
