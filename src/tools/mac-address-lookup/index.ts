import { Devices } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'MAC 地址厂商查询',
  path: '/mac-address-lookup',
  description: '根据 MAC 地址查询设备厂商与制造商。',
  keywords: ['mac', 'address', 'lookup', 'vendor', 'parser', 'manufacturer'],
  component: () => import('./mac-address-lookup.vue'),
  icon: Devices,
  createdAt: new Date('2023-04-06'),
});
