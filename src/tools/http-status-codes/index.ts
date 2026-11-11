import { HttpRound } from '@vicons/material';
import { defineTool } from '../tool';

import { codesByCategories } from './http-status-codes.constants';

export const tool = defineTool({
  name: 'HTTP 状态码大全',
  path: '/http-status-codes',
  description: '所有 HTTP 状态码及其名称与含义的列表。',
  keywords: [
    'http',
    'status',
    'codes',
    ...codesByCategories.flatMap(({ codes }) => codes.flatMap(({ code, name }) => [String(code), name])),
  ],
  explain: ['- 1xx 信息、2xx 成功、3xx 重定向、4xx 客户端错误、5xx 服务器错误。'],
  component: () => import('./http-status-codes.vue'),
  icon: HttpRound,
  createdAt: new Date('2023-04-13'),
});
