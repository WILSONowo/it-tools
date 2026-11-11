import { Code } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'JSON 转实体类',
  path: '/json-to-entity-classes',
  description: '由 JSON 对象生成带类型的 Java、C# 或 Go 类定义,支持嵌套对象与对象数组,自动处理非法字段名。',
  keywords: [
    'json',
    'java',
    'csharp',
    'c#',
    'golang',
    'go',
    'entity',
    'class',
    'pojo',
    'bean',
    'struct',
    'generator',
    'type',
  ],
  component: () => import('./json-to-entity-classes.vue'),
  icon: Code,
  createdAt: new Date('2026-09-03'),
});
