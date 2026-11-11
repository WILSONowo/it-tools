import { Table } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'JSON 转 Markdown 表格',
  path: '/json-to-markdown-table',
  description: '将对象数组(或单个对象)转换为 Markdown 表格,也可反向解析。',
  keywords: ['json', 'markdown', 'table', 'converter', 'md', 'rows', 'columns', 'array', 'objects'],
  component: () => import('./json-to-markdown-table.vue'),
  icon: Table,
  createdAt: new Date('2026-09-03'),
});
