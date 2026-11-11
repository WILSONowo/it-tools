import { SortAscendingNumbers } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'ASCII 码对照表',
  path: '/ascii-table',
  description: 'ASCII 字符表(0-127)查询:十进制、十六进制、二进制、字符与 HTML 实体。',
  keywords: [
    'ascii',
    'table',
    'character',
    'code',
    'decimal',
    'hex',
    'binary',
    'control',
    'html',
    'entity',
    'reference',
  ],
  component: () => import('./ascii-table.vue'),
  icon: SortAscendingNumbers,
  createdAt: new Date('2026-09-03'),
});
