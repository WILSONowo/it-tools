import { Typography } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: '字符串 Unicode 转义',
  path: '/string-unicode-converter',
  description: '将字符串转换为 Unicode 转义(\\uXXXX / \\u{...})并还原,支持代理对。',
  keywords: ['unicode', 'escape', 'string', 'encode', 'decode', 'utf', 'code point', 'surrogate', '\\u', 'converter'],
  component: () => import('./string-unicode-converter.vue'),
  icon: Typography,
  createdAt: new Date('2026-09-03'),
});
