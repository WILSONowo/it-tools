import { LetterCaseToggle } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: '大小写转换器',
  path: '/case-converter',
  description: '切换字符串的大小写并选择不同的命名格式(camel、snake、Pascal 等)。',
  keywords: [
    'case',
    'converter',
    'camelCase',
    'capitalCase',
    'constantCase',
    'dotCase',
    'headerCase',
    'noCase',
    'paramCase',
    'pascalCase',
    'pathCase',
    'sentenceCase',
    'snakeCase',
  ],
  component: () => import('./case-converter.vue'),
  icon: LetterCaseToggle,
});
