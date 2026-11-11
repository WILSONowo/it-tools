import { Clock } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Unix 时间戳转换',
  path: '/unix-time-converter',
  description: '在 Unix 时间戳(秒/毫秒)与可读日期之间转换,支持时区。',
  keywords: ['unix', 'timestamp', 'epoch', 'date', 'time', 'converter', 'seconds', 'milliseconds', 'timezone', 'UTC'],
  explain: [
    '- Unix 时间戳是从 1970-01-01 00:00:00 UTC 起经过的秒数(或毫秒数)。',
    '- 32 位时间戳将于 2038-01-19 溢出,现代系统多使用 64 位。',
    '- 同一时刻在世界各地的时间戳相同,显示为本地时间由时区决定。',
  ],
  component: () => import('./unix-time-converter.vue'),
  icon: Clock,
  createdAt: new Date('2026-09-03'),
});
