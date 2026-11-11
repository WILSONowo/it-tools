import { Braces } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'JSON5 格式化 / 校验',
  path: '/json5-formatter',
  description: '校验、格式化与压缩 JSON5 文档(允许注释、单引号、尾逗号)。',
  keywords: ['json5', 'json', 'formatter', 'validator', 'minify', 'comments', 'trailing', 'comma', 'parse'],
  component: () => import('./json5-formatter.vue'),
  icon: Braces,
  createdAt: new Date('2026-09-03'),
});
