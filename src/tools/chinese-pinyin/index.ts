import { LanguageHiragana } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: '汉字转拼音',
  path: '/chinese-pinyin',
  description: '将中文转换为带声调(或首字母)的拼音,支持多音字。',
  keywords: ['chinese', 'pinyin', 'hanzi', 'han', '拼音', '汉字', 'first-letter', 'tone', 'mandarin', 'convert'],
  explain: ['- 拼音方案采用《汉语拼音方案》;多音字按词义取音。'],
  component: () => import('./chinese-pinyin.vue'),
  icon: LanguageHiragana,
  createdAt: new Date('2026-09-03'),
});
