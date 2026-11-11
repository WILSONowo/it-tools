import { Table } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: '文本转 HTML 表格',
  path: '/text-to-html-table',
  description: '将带分隔符的多行文本转换为 HTML 表格代码,支持自定义分隔符与首行表头。',
  keywords: ['text', 'html', 'table', 'convert', 'csv', 'tsv', '分隔符', '表格'],
  component: () => import('./text-to-html-table.vue'),
  icon: Table,
  createdAt: new Date('2026-09-03'),
});
