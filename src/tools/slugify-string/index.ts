import { AbcRound } from '@vicons/material';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: '字符串 Slug 化',
  path: '/slugify-string',
  description: '让字符串变得对 URL、文件名和 ID 安全。',
  keywords: ['slugify', 'string', 'escape', 'emoji', 'special', 'character', 'space', 'trim'],
  component: () => import('./slugify-string.vue'),
  icon: AbcRound,
});
