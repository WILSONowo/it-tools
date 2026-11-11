import { Key } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: '古典密码(凯撒/维吉尼亚)',
  path: '/classic-ciphers',
  description: '使用凯撒位移(支持暴力破解)与维吉尼亚密钥进行古典密码加解密。',
  keywords: [
    'caesar',
    'vigenere',
    'vigenère',
    'cipher',
    'classic',
    'shift',
    'keyword',
    'brute',
    'force',
    'encrypt',
    'decrypt',
    'secret',
  ],
  explain: [
    '- 凯撒密码将字母按固定位移,暴力破解只需尝试 26 种可能。',
    '- 维吉尼亚密码用关键词循环作为每位位移,破解需先猜密钥长度。',
  ],
  component: () => import('./classic-ciphers.vue'),
  icon: Key,
  createdAt: new Date('2026-09-03'),
});
