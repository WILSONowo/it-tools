import { Binary } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: '随机 IP / MAC 生成器',
  path: '/random-ip-generator',
  description: '生成随机 IPv4、IPv6 与 MAC 地址,可配置数量与格式。',
  keywords: ['random', 'ip', 'ipv4', 'ipv6', 'mac', 'address', 'generator', 'subnet', 'range'],
  component: () => import('./random-ip-generator.vue'),
  icon: Binary,
  createdAt: new Date('2026-09-03'),
});
