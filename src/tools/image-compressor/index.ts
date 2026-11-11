import { AdjustmentsHorizontal } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: '图片压缩',
  path: '/image-compressor',
  description: '在线压缩 PNG、JPG、GIF、BMP、WebP 图片:可调压缩质量与像素尺寸,支持批量、本地处理不上传。',
  keywords: ['image', 'compress', 'jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'photo', 'quality', 'resize', '压缩'],
  component: () => import('./image-compressor.vue'),
  icon: AdjustmentsHorizontal,
  createdAt: new Date('2026-09-03'),
});
