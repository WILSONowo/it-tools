import { Code } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'HTML / JS 字符串互转',
  path: '/html-js-converter',
  description:
    '将 HTML 代码转换为 JavaScript 字符串字面量(双引号/单引号/模板字符串),并可安全地(不执行代码)还原为 HTML。',
  keywords: ['html', 'js', 'javascript', 'string', 'escape', 'unescape', 'literal', 'template', 'converter', 'quote'],
  component: () => import('./html-js-converter.vue'),
  icon: Code,
  createdAt: new Date('2026-09-03'),
});
