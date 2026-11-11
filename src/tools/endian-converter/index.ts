import { SwapVertOutlined } from '@vicons/material';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: '大小端字节序转换',
  path: '/endian-converter',
  description: '整数与字节数组的大端/小端互转,支持 16/32/64 位及任意字节序反转。',
  keywords: ['endian', 'little', 'big', 'byte', 'order', 'swap', 'hex', 'int', '大小端', '字节序'],
  component: () => import('./endian-converter.vue'),
  icon: SwapVertOutlined,
  createdAt: new Date('2026-09-03'),
});
