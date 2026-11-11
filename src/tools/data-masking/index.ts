import { EyeOff } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: '数据脱敏',
  path: '/data-masking',
  description: '对文本中的敏感数据进行打码:手机号、身份证、邮箱、姓名、银行卡、IP 等。',
  keywords: ['mask', 'desensitize', 'data', 'privacy', 'phone', 'email', 'card', 'id', 'sensitive', 'hide', '脱敏'],
  component: () => import('./data-masking.vue'),
  icon: EyeOff,
  createdAt: new Date('2026-09-03'),
});
