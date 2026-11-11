import { Alarm } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Crontab 生成器',
  path: '/crontab-generator',
  description: '校验并生成 crontab,同时查看 cron 计划的人类可读描述。',
  keywords: [
    'crontab',
    'generator',
    'cronjob',
    'cron',
    'schedule',
    'parse',
    'expression',
    'year',
    'month',
    'week',
    'day',
    'minute',
    'second',
  ],
  component: () => import('./crontab-generator.vue'),
  icon: Alarm,
});
