import { Binary } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'IP 地址转数字',
  path: '/ip-number-converter',
  description: '将 IPv4/IPv6 地址转换为其数值(32 位/128 位无符号)并可反向转换。',
  keywords: ['ip', 'ipv4', 'ipv6', 'number', 'integer', 'convert', 'decimal', '32bit', '128bit', 'hex'],
  component: () => import('./ip-number-converter.vue'),
  icon: Binary,
  createdAt: new Date('2026-09-03'),
});
