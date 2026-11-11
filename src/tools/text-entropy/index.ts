import { ChartDots } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: '文本熵 / 字符频率',
  path: '/text-entropy',
  description: '计算文本的香农熵与每个字符的出现频率,按占比排序展示。',
  keywords: [
    'entropy',
    'shannon',
    'frequency',
    'character',
    'chars',
    'statistics',
    'randomness',
    'information',
    'letter',
  ],
  component: () => import('./text-entropy.vue'),
  icon: ChartDots,
  createdAt: new Date('2026-09-03'),
});
