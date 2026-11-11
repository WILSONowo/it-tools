import { DeviceMobile } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'OTP 一次性密码',
  path: '/otp-generator',
  description: '生成并校验基于时间的一次性密码(TOTP),用于多因素认证。',
  keywords: [
    'otp',
    'code',
    'generator',
    'validator',
    'one',
    'time',
    'password',
    'authentication',
    'MFA',
    'mobile',
    'device',
    'security',
    'TOTP',
    'Time',
    'HMAC',
  ],
  component: () => import('./otp-code-generator-and-validator.vue'),
  icon: DeviceMobile,
});
