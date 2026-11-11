import { AlignJustified } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'BIP39 助记词生成器',
  path: '/bip39-generator',
  description: '从现有或随机的助记词生成 BIP39 口令,或由口令反查助记词。',
  keywords: ['BIP39', 'passphrase', 'generator', 'mnemonic', 'entropy'],
  component: () => import('./bip39-generator.vue'),
  icon: AlignJustified,
});
