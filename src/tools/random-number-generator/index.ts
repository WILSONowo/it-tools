import { Dice } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: '随机数生成器',
  path: '/random-number-generator',
  description: '生成指定范围内的随机整数或浮点数,支持数量、唯一、排序与自定义分隔符。',
  keywords: ['random', 'number', 'integer', 'float', 'generator', 'unique', 'sort', 'range', 'lottery'],
  component: () => import('./random-number-generator.vue'),
  icon: Dice,
  createdAt: new Date('2026-09-03'),
});
