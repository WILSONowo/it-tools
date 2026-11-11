import { Temperature } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: '温度换算器',
  path: '/temperature-converter',
  description: '开尔文、摄氏、华氏、兰金、列氏、牛顿等温度单位互转。',
  keywords: [
    'temperature',
    'converter',
    'degree',
    'Kelvin',
    'Celsius',
    'Fahrenheit',
    'Rankine',
    'Delisle',
    'Newton',
    'Réaumur',
    'Rømer',
  ],
  component: () => import('./temperature-converter.vue'),
  icon: Temperature,
});
