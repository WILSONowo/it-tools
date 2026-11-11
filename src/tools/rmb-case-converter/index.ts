import { CurrencyRenminbi } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: '人民币金额大小写转换',
  path: '/rmb-case-converter',
  description: '将数字金额转换为中文大写(壹贰叁...),也可将大写金额解析为数字。',
  keywords: ['rmb', 'yuan', 'chinese', 'uppercase', 'money', 'amount', '大写', '人民币', '金额', '壹', '贰', 'convert'],
  explain: ['- 中文大写金额:壹贰叁肆伍陆柒捌玖零,单位:拾佰仟万亿。', '- 财务票据必须用大写,防止涂改。'],
  component: () => import('./rmb-case-converter.vue'),
  icon: CurrencyRenminbi,
  createdAt: new Date('2026-09-03'),
});
