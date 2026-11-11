import { Refresh } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: '随机测试数据生成',
  path: '/random-data-generator',
  description: '批量生成随机测试数据:数字、字符串、十六进制、日期、邮箱、手机号等。',
  keywords: ['random', 'data', 'generator', 'test', 'mock', 'fake', 'email', 'name', 'phone', 'hex', 'number', 'date'],
  component: () => import('./random-data-generator.vue'),
  icon: Refresh,
  createdAt: new Date('2026-09-03'),
});
