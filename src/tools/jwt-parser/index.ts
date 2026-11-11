import { Key } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'JWT 解析器',
  path: '/jwt-parser',
  description: '解析并解码 JSON Web Token(JWT),展示其内容。',
  keywords: [
    'jwt',
    'parser',
    'decode',
    'typ',
    'alg',
    'iss',
    'sub',
    'aud',
    'exp',
    'nbf',
    'iat',
    'jti',
    'json',
    'web',
    'token',
  ],
  explain: ['- JWT 由 Header.Payload.Signature 三段 Base64url 组成。', '- 仅解析不等于验签;请务必验证签名与过期时间。'],
  component: () => import('./jwt-parser.vue'),
  icon: Key,
});
