import { Link } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'URL 编码 / 解码',
  path: '/url-encoder',
  description: '对文本进行 URL 编码(也称"百分号编码")或解码。',
  keywords: ['url', 'encode', 'decode', 'percent', '%20', 'format'],
  explain: [
    '- URL 编码(百分号编码)把非安全字符转为 %XX 十六进制。',
    "- 本工具使用 encodeURIComponent:除 A-Z a-z 0-9 - _ . ! ~ * ' ( ) 外的字符都会被编码(包括 / ? & = # 等),适合编码单个参数值。",
    '- 解码时如遇到不完整或非法的 %XX 序列(如 %E0%A4)会提示错误。',
  ],
  component: () => import('./url-encoder.vue'),
  icon: Link,
});
