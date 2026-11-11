import { FileDigit } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: '文件哈希计算',
  path: '/file-hash',
  description: '拖入或选择文件,计算其 MD5、SHA-1、SHA-256、SHA-512、SHA3、SM3 等哈希值。',
  keywords: ['file', 'hash', 'checksum', 'md5', 'sha', 'sha256', 'sm3', 'sha3', 'verify', 'download'],
  component: () => import('./file-hash.vue'),
  icon: FileDigit,
  createdAt: new Date('2026-09-03'),
});
