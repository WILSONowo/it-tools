import { Code } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'HTML / JS 字符串互转',
  path: '/html-js-converter',
  description: '将 HTML 代码转换为 JavaScript 字符串字面量(转义),并可还原为 HTML。',
  keywords: ['html', 'js', 'javascript', 'string', 'escape', 'unescape', 'literal', 'template', 'converter', 'quote'],
  component: () => import('./html-js-converter.vue'),
  icon: Code,
  createdAt: new Date('2026-09-03'),
});
