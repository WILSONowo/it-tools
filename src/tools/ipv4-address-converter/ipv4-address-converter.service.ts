import _ from 'lodash';
import { parseIpv4 } from '@/utils/ipv4';

export { ipv4ToInt, ipv4ToIpv6, isValidIpv4 };

function ipv4ToInt({ ip }: { ip: string }) {
  return parseIpv4(ip) ?? 0;
}

function ipv4ToIpv6({ ip, prefix = '0000:0000:0000:0000:0000:ffff:' }: { ip: string; prefix?: string }) {
  if (!isValidIpv4({ ip })) {
    return '';
  }

  return (
    prefix +
    _.chain(ip)
      .trim()
      .split('.')
      .map((part) => parseInt(part).toString(16).padStart(2, '0'))
      .chunk(2)
      .map((blocks) => blocks.join(''))
      .join(':')
      .value()
  );
}

function isValidIpv4({ ip }: { ip: string }) {
  return parseIpv4(ip) !== null;
}
