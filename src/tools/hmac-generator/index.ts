import { ShortTextRound } from '@vicons/material';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'HMAC 生成器',
  path: '/hmac-generator',
  description: '使用密钥和常用哈希算法计算基于哈希的消息认证码(HMAC)。',
  keywords: ['hmac', 'generator', 'MD5', 'SHA1', 'SHA256', 'SHA224', 'SHA512', 'SHA384', 'SHA3', 'RIPEMD160'],
  component: () => import('./hmac-generator.vue'),
  icon: ShortTextRound,
});
