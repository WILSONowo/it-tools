import { ArrowsJoin } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'IPv4 CIDR 聚合',
  path: '/cidr-aggregator',
  description: '将多个 IPv4 地址或 CIDR 网段聚合为尽可能少的超网。',
  keywords: ['cidr', 'aggregate', 'supernet', 'ipv4', 'summarize', 'merge', 'subnet', 'network'],
  component: () => import('./cidr-aggregator.vue'),
  icon: ArrowsJoin,
  createdAt: new Date('2026-09-03'),
});
