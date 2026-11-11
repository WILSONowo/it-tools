import { Code } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'HTML 实体转义',
  path: '/html-entities',
  description:
    '转义 HTML 特殊字符(<、>、&、"、\'),或反转义 HTML 实体(含 &nbsp;、&copy; 等命名实体及 &#20013;、&#x4e2d; 等数字实体)。',
  keywords: ['html', 'entities', 'escape', 'unescape', 'decode', 'special', 'characters', 'tags', 'nbsp'],
  component: () => import('./html-entities.vue'),
  icon: Code,
});
