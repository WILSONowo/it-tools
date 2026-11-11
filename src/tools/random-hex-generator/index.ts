import { Binary } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: '随机 HEX 字符串生成器',
  path: '/random-hex-generator',
  description: '批量生成随机十六进制字符串,可设大小写与长度,支持下载为 HEX 文本或二进制文件。',
  keywords: ['random', 'hex', 'hexadecimal', 'string', 'generator', 'binary', 'bin', 'download', 'byte'],
  component: () => import('./random-hex-generator.vue'),
  icon: Binary,
  createdAt: new Date('2026-09-03'),
});
