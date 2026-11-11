import { Unlink } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'URL 解析器',
  path: '/url-parser',
  description: '解析 URL 字符串,获取各组成部分(协议、源、参数、端口、用户名等)。',
  keywords: ['url', 'parser', 'protocol', 'origin', 'params', 'port', 'username', 'password', 'href'],
  component: () => import('./url-parser.vue'),
  icon: Unlink,
});
