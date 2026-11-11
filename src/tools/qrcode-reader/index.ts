import { Scan } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: '二维码识别',
  path: '/qrcode-reader',
  description: '从图片中识别二维码/条形码内容,支持上传图片或直接调用摄像头扫描。',
  keywords: ['qrcode', 'qr', 'reader', 'scan', 'recognize', 'barcode', 'decode', '识别', '扫描'],
  component: () => import('./qrcode-reader.vue'),
  icon: Scan,
  createdAt: new Date('2026-09-03'),
});
