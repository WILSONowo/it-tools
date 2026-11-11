import { Hourglass } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'ETA 预计完成时间',
  path: '/eta-calculator',
  description: '估算任务预计完成时间(ETA),输入当前进度即可推算结束时间。',
  keywords: ['eta', 'calculator', 'estimated', 'time', 'arrival', 'average'],
  component: () => import('./eta-calculator.vue'),
  icon: Hourglass,
});
