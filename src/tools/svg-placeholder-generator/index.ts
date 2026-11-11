import { ImageOutlined } from '@vicons/material';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'SVG 占位图生成器',
  path: '/svg-placeholder-generator',
  description: '生成可用作应用占位图的 SVG 图片。',
  keywords: ['svg', 'placeholder', 'generator', 'image', 'size', 'mockup'],
  component: () => import('./svg-placeholder-generator.vue'),
  icon: ImageOutlined,
});
