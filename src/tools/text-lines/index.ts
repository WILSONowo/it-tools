import { ListNumbers } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: '文本行处理工具',
  path: '/text-lines',
  description: '批量处理多行文本:加/删行号、去重、打乱、排序、正则筛选、合并等。',
  keywords: [
    'text',
    'lines',
    'number',
    'line',
    'join',
    'dedupe',
    'unique',
    'duplicate',
    'shuffle',
    'sort',
    'reverse',
    'filter',
    'regex',
    'remove',
    'blank',
    'whitespace',
    'tool',
  ],
  explain: ['- 先对行做处理(去重/排序/过滤),再统一拼接输出,避免重复操作。'],
  component: () => import('./text-lines.vue'),
  icon: ListNumbers,
});
