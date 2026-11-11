import { Link } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'URL 编码 / 解码',
  path: '/url-encoder',
  description: '对文本进行 URL 编码(也称"百分号编码")或解码。',
  keywords: ['url', 'encode', 'decode', 'percent', '%20', 'format'],
  explain: [
    '- URL 编码(百分号编码)把非安全字符转为 %XX 十六进制。',
    '- encodeURIComponent 会编码所有非字母数字字符,适合作为参数值。',
  ],
  component: () => import('./url-encoder.vue'),
  icon: Link,
});
