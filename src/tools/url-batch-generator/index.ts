import { Link } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'URL 批量生成器',
  path: '/url-batch-generator',
  description: '通过参数取值组合批量生成 URL,支持多参数多取值(笛卡尔积)与按行模板两种模式。',
  keywords: ['url', 'batch', 'generate', 'param', 'combine', 'template', '批量', '生成'],
  component: () => import('./url-batch-generator.vue'),
  icon: Link,
  createdAt: new Date('2026-09-03'),
});
