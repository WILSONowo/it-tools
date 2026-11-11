import { ArrowsLeftRight } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: '图片格式转换',
  path: '/image-converter',
  description: '批量转换图片格式:JPG、PNG、WebP、BMP、ICO 互转,可调质量,浏览器本地处理不上传。',
  keywords: ['image', 'convert', 'jpg', 'jpeg', 'png', 'webp', 'bmp', 'ico', 'format', '转换'],
  component: () => import('./image-converter.vue'),
  icon: ArrowsLeftRight,
  createdAt: new Date('2026-09-03'),
});
