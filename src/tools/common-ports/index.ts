import { Window } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: '常用端口参考',
  path: '/common-ports',
  description: '常用 TCP/UDP 端口及其对应服务与协议的参考表。',
  keywords: [
    'port',
    'tcp',
    'udp',
    'service',
    'protocol',
    'http',
    'https',
    'ssh',
    'ftp',
    'smtp',
    'dns',
    'reference',
    'well-known',
  ],
  component: () => import('./common-ports.vue'),
  icon: Window,
  createdAt: new Date('2026-09-03'),
});
