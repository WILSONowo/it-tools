import { Barcode } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: '条形码生成器',
  path: '/barcode-generator',
  description: '生成 EAN-13/EAN-8/Code128/Code39/UPC-A/ITF-14 等常见条形码,可下载 PNG/SVG。',
  keywords: ['barcode', 'bar', 'code', 'ean', 'upc', 'code128', 'code39', 'itf', '条形码', '生成'],
  component: () => import('./barcode-generator.vue'),
  icon: Barcode,
  createdAt: new Date('2026-09-03'),
});
