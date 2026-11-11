import { Lock } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: '文本加密/解密',
  path: '/encryption',
  description: '使用 AES、TripleDES、Rabbit、RC4 等加密算法对文本进行加密与解密。',
  keywords: ['cypher', 'encipher', 'text', 'AES', 'TripleDES', 'Rabbit', 'RC4'],
  explain: [
    '- 对称加密使用同一密钥加解密;密钥泄露等于数据泄露。',
    '- AES 为现代标准;RC4/Rabbit 等旧算法仅作研究使用。',
  ],
  component: () => import('./encryption.vue'),
  icon: Lock,
  redirectFrom: ['/cypher'],
});
