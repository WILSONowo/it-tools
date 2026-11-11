import { Code } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'HTML 实体转义',
  path: '/html-entities',
  description: '转义或反转义 HTML 实体(将 <、>、&、"、\' 转为 HTML 版本)。',
  keywords: ['html', 'entities', 'escape', 'unescape', 'special', 'characters', 'tags'],
  component: () => import('./html-entities.vue'),
  icon: Code,
});
