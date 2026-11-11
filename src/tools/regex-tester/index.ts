import { TestPipe } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: '正则表达式测试',
  path: '/regex-tester',
  description: '实时测试 JavaScript 正则:匹配、替换、标志、分组与捕获详情。',
  keywords: [
    'regex',
    'regexp',
    'regular',
    'expression',
    'tester',
    'match',
    'replace',
    'flags',
    'capture',
    'group',
    'javascript',
  ],
  explain: ['- 正则中 d 表示数字、w 表示字母数字下划线、s 表示空白。', '- 分组 () 可捕获,配合 $1 在替换时引用。'],
  component: () => import('./regex-tester.vue'),
  icon: TestPipe,
  createdAt: new Date('2026-09-03'),
});
