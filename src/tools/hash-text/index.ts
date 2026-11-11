import { EyeOff } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: '文本哈希',
  path: '/hash-text',
  description: '使用所需算法(MD5、SHA1、SHA256、SHA224、SHA512、SHA384、SHA3-512、RIPEMD160、SM3)对文本进行哈希。',
  keywords: [
    'hash',
    'digest',
    'crypto',
    'security',
    'text',
    'MD5',
    'SHA1',
    'SHA256',
    'SHA224',
    'SHA512',
    'SHA384',
    'SHA3',
    'RIPEMD160',
  ],
  explain: [
    '- 哈希是单向函数:由输入计算摘要很容易,由摘要反推输入不可行。',
    '- MD5/SHA1 已不安全,建议签名等安全场景使用 SHA-256 及以上。',
    '- 同一输入永远得到同一摘要,常用于校验文件完整性、数据去重与数字签名。',
    '- 不要用这些快速哈希(即使加盐)存储密码:GPU 每秒可尝试数十亿次;密码存储请使用 bcrypt、Argon2 或 scrypt 等专用的慢哈希。',
  ],
  component: () => import('./hash-text.vue'),
  icon: EyeOff,
  redirectFrom: ['/hash'],
});
