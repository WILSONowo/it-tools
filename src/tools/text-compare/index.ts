import { FileDiff } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: '文本对比 (Diff)',
  path: '/text-compare',
  description: '对比两段文本或代码并逐行高亮差异。',
  keywords: ['diff', 'compare', 'text', 'code', 'difference', 'git', 'merge', 'side-by-side', 'change'],
  explain: ['- 基于最长公共子序列的行级 diff,变更行支持字符级高亮。'],
  component: () => import('./text-compare.vue'),
  icon: FileDiff,
  createdAt: new Date('2026-09-03'),
});
