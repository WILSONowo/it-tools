import { Lock } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: '文本加密/解密',
  path: '/encryption',
  description: '使用 AES、TripleDES、Rabbit、RC4 等加密算法对文本进行加密与解密。',
  keywords: ['cypher', 'encipher', 'text', 'AES', 'TripleDES', 'Rabbit', 'RC4'],
  explain: [
    '- 对称加密使用同一密钥加解密;密钥泄露等于数据泄露。',
    '- 本工具基于 crypto-js:输入的「密钥」其实是口令,会经过一次基于 MD5 的 EVP_BytesToKey(随机盐、仅迭代 1 次)派生出真正的密钥,几乎没有抗暴力破解能力,请使用足够长且随机的强口令。',
    '- 推荐使用 AES;Rabbit 为流密码,RC4 已被证明存在严重偏差、不应再用于保护数据;TripleDES 速度慢且分组仅 64 位,仅用于兼容旧系统。',
    '- 输出为 OpenSSL 兼容格式(Base64,以 `U2FsdGVkX1` 即 `Salted__` 开头),不含完整性校验;密钥错误时可能解密失败或得到乱码。',
  ],
  component: () => import('./encryption.vue'),
  icon: Lock,
  redirectFrom: ['/cypher'],
});
