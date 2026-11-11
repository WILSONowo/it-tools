import { PasswordRound } from '@vicons/material';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Basic Auth 生成器',
  path: '/basic-auth-generator',
  description: '由用户名和密码生成 Base64 编码的 HTTP Basic 认证请求头。',
  keywords: [
    'basic',
    'auth',
    'generator',
    'username',
    'password',
    'base64',
    'authentication',
    'header',
    'authorization',
  ],
  component: () => import('./basic-auth-generator.vue'),
  icon: PasswordRound,
});
