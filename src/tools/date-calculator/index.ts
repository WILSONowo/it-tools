import { CalendarStats } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: '日期计算器',
  path: '/date-calculator',
  description: '计算两个日期相差的年月日,或对某个日期做加减运算。',
  keywords: [
    'date',
    'calculator',
    'difference',
    'between',
    'add',
    'subtract',
    'days',
    'weeks',
    'months',
    'years',
    'age',
  ],
  component: () => import('./date-calculator.vue'),
  icon: CalendarStats,
  createdAt: new Date('2026-09-03'),
});
