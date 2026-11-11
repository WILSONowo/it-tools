import { LockSquare } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Bcrypt 哈希',
  path: '/bcrypt',
  description: '使用 bcrypt 对字符串进行哈希与比对,bcrypt 是一种基于 Blowfish 的密码哈希算法。',
  keywords: ['bcrypt', 'hash', 'compare', 'password', 'salt', 'round', 'storage', 'crypto'],
  component: () => import('./bcrypt.vue'),
  icon: LockSquare,
});
