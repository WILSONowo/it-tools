import { Hash } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: '校验和计算(BCC / XOR / LRC)',
  path: '/checksum-bcc-lrc',
  description: '计算串口通信常用的字节级校验:XOR(BCC)、累加和、LRC、CRC-8 与 CRC-16/MODBUS。',
  keywords: ['checksum', 'bcc', 'xor', 'lrc', 'crc', 'byte', 'hex', 'uart', 'serial', 'modbus', 'parity', 'block'],
  component: () => import('./checksum-bcc-lrc.vue'),
  icon: Hash,
  createdAt: new Date('2026-09-03'),
});
