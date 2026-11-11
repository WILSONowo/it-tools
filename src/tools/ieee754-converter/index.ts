import { Binary } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'IEEE 754 浮点转换',
  path: '/ieee754-converter',
  description: '查看 32/64 位浮点数的 IEEE 754 二进制表示、十六进制与组成字段(符号/指数/尾数)。',
  keywords: ['ieee', '754', 'float', 'double', 'single', 'binary', 'hex', 'mantissa', 'exponent', '浮点'],
  component: () => import('./ieee754-converter.vue'),
  icon: Binary,
  createdAt: new Date('2026-09-03'),
});
