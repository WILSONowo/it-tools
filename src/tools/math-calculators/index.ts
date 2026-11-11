import { MathSymbols } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: '数学计算器',
  path: '/math-calculators',
  description: '日常数学工具集:百分比、平均数/方差、最大公约数/最小公倍数、分数与质因数分解。',
  keywords: [
    'math',
    'calculator',
    'percent',
    'percentage',
    'average',
    'mean',
    'variance',
    'gcd',
    'lcm',
    'fraction',
    'prime',
    'factor',
  ],
  component: () => import('./math-calculators.vue'),
  icon: MathSymbols,
  createdAt: new Date('2026-09-03'),
});
