import { Clock } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: '世界时钟',
  path: '/world-clock',
  description: '一览多个城市与时区的当前时间,实时更新。',
  keywords: ['world', 'clock', 'timezone', 'time', 'city', 'utc', 'current', 'international'],
  component: () => import('./world-clock.vue'),
  icon: Clock,
  createdAt: new Date('2026-09-03'),
});
