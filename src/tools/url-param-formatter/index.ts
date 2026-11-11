import { Brackets } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'URL 参数格式化',
  path: '/url-param-formatter',
  description: '将 URL 查询字符串排成多行便于阅读,支持参数与 JSON 互转、编码切换。',
  keywords: ['url', 'param', 'query', 'string', 'format', 'json', 'format', '参数', '格式化'],
  component: () => import('./url-param-formatter.vue'),
  icon: Brackets,
  createdAt: new Date('2026-09-03'),
});
