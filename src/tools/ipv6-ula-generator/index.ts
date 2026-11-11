import { BuildingFactory } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'IPv6 ULA 生成器',
  path: '/ipv6-ula-generator',
  description: '根据 RFC4193 为你的网络生成本地、不可路由的 IPv6 地址。',
  keywords: ['ipv6', 'ula', 'generator', 'rfc4193', 'network', 'private'],
  component: () => import('./ipv6-ula-generator.vue'),
  icon: BuildingFactory,
  createdAt: new Date('2023-04-09'),
});
