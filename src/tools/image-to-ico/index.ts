import { AppWindow } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: '图片转 ICO 图标',
  path: '/image-to-ico',
  description: '将 JPG、PNG、WebP 等图片转换为 ICO 图标,支持多尺寸与缩放/裁剪模式,浏览器本地完成。',
  keywords: ['ico', 'icon', 'image', 'convert', 'favicon', '图标', '尺寸', '转换'],
  component: () => import('./image-to-ico.vue'),
  icon: AppWindow,
  createdAt: new Date('2026-09-03'),
});
