import { FileDigit } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Base64 字符串编码/解码',
  path: '/base64-string-converter',
  description: '在字符串(UTF-8)与 Base64 之间互相编码解码,支持标准与 URL 安全两种变体。',
  keywords: ['base64', 'converter', 'conversion', 'web', 'data', 'format', 'atob', 'btoa', 'url-safe', 'base64url'],
  explain: [
    '- Base64 用 64 个可打印字符表示二进制,常用于在文本协议中传输数据。',
    '- URL 场景请打开「URL 安全」开关(- _ 替代 + /,去掉 =),解码时也会接受缺省的 =。',
    '- Base32、Base58、Hex 等其他编码请使用「Base 编码转换」工具。',
  ],
  component: () => import('./base64-string-converter.vue'),
  icon: FileDigit,
  redirectFrom: ['/file-to-base64', '/base64-converter'],
});
