import { Fingerprint } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'UUID / ULID / NanoID 生成器',
  path: '/uuid-generator',
  description: '生成 UUID(v1/v4)、UUIDv7、ULID 与 NanoID 标识符:可调数量、大小写、连字符与大括号。',
  keywords: ['uuid', 'v4', 'random', 'id', 'alphanumeric', 'identity', 'token', 'string', 'identifier', 'unique'],
  component: () => import('./uuid-generator.vue'),
  icon: Fingerprint,
});
