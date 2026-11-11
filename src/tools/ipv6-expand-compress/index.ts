import { SortAscending } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'IPv6 压缩 / 展开',
  path: '/ipv6-expand-compress',
  description: '将 IPv6 简写形式(含 ::)展开为完整格式,或将完整 IPv6 压缩为最短形式。',
  keywords: ['ipv6', 'expand', 'compress', 'shorten', 'address', '::', 'hex', 'full'],
  component: () => import('./ipv6-expand-compress.vue'),
  icon: SortAscending,
  createdAt: new Date('2026-09-03'),
});
