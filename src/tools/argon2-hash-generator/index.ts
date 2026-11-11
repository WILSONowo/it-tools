import { Lock } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Argon2 哈希生成器',
  path: '/argon2-hash-generator',
  description: '使用 Argon2 算法对字符串(密码)进行哈希与校验。',
  keywords: ['argon2', 'hash', 'generator', 'password', 'salt', 'crypto', 'security'],
  component: () => import('./argon2-hash-generator.vue'),
  icon: Lock,
  createdAt: new Date('2023-04-16'),
});
