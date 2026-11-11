import { Certificate } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'RSA 密钥对生成器',
  path: '/rsa-key-pair-generator',
  description: '生成新的随机 RSA 公私钥 PEM 证书。',
  keywords: ['rsa', 'key', 'pair', 'generator', 'public', 'private', 'secret', 'ssh', 'pem'],
  explain: ['- 私钥必须保密;公钥可公开分发。', '- 常用长度 2048/3072/4096 位,越长越安全但越慢。'],
  component: () => import('./rsa-key-pair-generator.vue'),
  icon: Certificate,
});
