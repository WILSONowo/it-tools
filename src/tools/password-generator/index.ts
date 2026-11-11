import { Key } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: '密码生成器',
  path: '/password-generator',
  description: '生成自定义长度与字符集(大小写、数字、符号)的强随机密码。',
  keywords: ['password', 'generator', 'random', 'secure', 'strong', 'letters', 'numbers', 'symbols', 'credentials'],
  component: () => import('./password-generator.vue'),
  icon: Key,
  createdAt: new Date('2026-09-03'),
});
