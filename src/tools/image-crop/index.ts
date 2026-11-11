import { Crop } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: '图片裁剪',
  path: '/image-crop',
  description: '将图片裁剪成指定尺寸或形状(矩形/圆形),内置证件照等常用尺寸,支持自定义宽高,浏览器本地完成。',
  keywords: ['image', 'crop', 'cut', 'resize', 'canvas', '证件照', '裁剪', '圆形', '尺寸'],
  component: () => import('./image-crop.vue'),
  icon: Crop,
  createdAt: new Date('2026-09-03'),
  explain: [
    '上传图片后选择裁剪形状和尺寸,可在预览区调整裁剪位置。',
    '点击裁剪后可预览结果,确认无误再下载到本地。',
    '## 支持格式',
    '- 图片格式:png | jpg | jpeg | webp | bmp',
  ],
});
