import { Binary } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Base 编码转换',
  path: '/base-encoding',
  description: 'Base16/Base32/Base58/Base62/Base85 编码解码,输入输出为 UTF-8 文本。',
  keywords: ['base', 'base16', 'base32', 'base58', 'base62', 'base85', 'encode', 'decode', '编码', '解码'],
  component: () => import('./base-encoding.vue'),
  icon: Binary,
  createdAt: new Date('2026-09-03'),
});
