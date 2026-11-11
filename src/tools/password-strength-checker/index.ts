import { ShieldCheck } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: '密码强度检测',
  path: '/password-strength-checker',
  description: '评估密码强度并生成强密码:长度、熵、常见词检测等。',
  keywords: [
    'password',
    'strength',
    'checker',
    'entropy',
    'secure',
    'security',
    'generator',
    'random',
    'crack',
    'score',
  ],
  component: () => import('./password-strength-checker.vue'),
  icon: ShieldCheck,
  createdAt: new Date('2026-09-03'),
});
