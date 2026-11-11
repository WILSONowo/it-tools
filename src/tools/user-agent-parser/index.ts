import { Browser } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'User-Agent 解析',
  path: '/user-agent-parser',
  description: '从 User-Agent 字符串解析浏览器、引擎、操作系统、CPU 与设备类型。',
  keywords: ['user', 'agent', 'parser', 'browser', 'engine', 'os', 'cpu', 'device', 'user-agent', 'client'],
  component: () => import('./user-agent-parser.vue'),
  icon: Browser,
  createdAt: new Date('2023-04-06'),
});
