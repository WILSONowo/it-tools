import { Braces } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: '随机 JSON 数据生成器',
  path: '/random-json-data-generator',
  description: '按结构生成随机 JSON 文档:对象、数组、字符串、数字、布尔、日期等。',
  keywords: ['json', 'random', 'data', 'generator', 'mock', 'fake', 'schema', 'test', 'array', 'object'],
  component: () => import('./random-json-data-generator.vue'),
  icon: Braces,
  createdAt: new Date('2026-09-03'),
});
