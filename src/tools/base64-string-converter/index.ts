import { FileDigit } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Base64 / Base32 / Hex 编码转换',
  path: '/base64-string-converter',
  description: '在 Base64(标准/URL 安全)、Base32、十六进制与字符串之间互相编码解码。',
  keywords: ['base64', 'converter', 'conversion', 'web', 'data', 'format', 'atob', 'btoa'],
  explain: [
    '- Base64 用 64 个可打印字符表示二进制,常用于在文本协议中传输数据。',
    '- URL 场景请用 URL-safe 变体(- _ 替代 + /,去掉 =)。',
    '- Base32 主要用于对大小写不敏感或人工转录场景(如密钥)。',
  ],
  component: () => import('./base64-string-converter.vue'),
  icon: FileDigit,
  redirectFrom: ['/file-to-base64', '/base64-converter'],
});
