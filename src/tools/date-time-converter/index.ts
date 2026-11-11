import { Calendar } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: '日期时间转换器',
  path: '/date-converter',
  description: '在不同格式之间转换日期和时间(ISO、UTC、Unix 时间戳等)。',
  keywords: ['date', 'time', 'converter', 'iso', 'utc', 'timezone', 'year', 'month', 'day', 'minute', 'seconde'],
  component: () => import('./date-time-converter.vue'),
  icon: Calendar,
});
