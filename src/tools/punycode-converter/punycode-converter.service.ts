import punycode from 'punycode';

export type PunycodeDirection = 'ascii' | 'unicode';

function convertHostname(hostname: string, direction: PunycodeDirection) {
  // Domain labels are case-insensitive; lower-casing also lets `XN--` prefixes be recognized
  const lower = hostname.toLowerCase();
  return direction === 'ascii' ? punycode.toASCII(lower) : punycode.toUnicode(lower);
}

const URL_REGEX = /^([a-z][a-z\d+.-]*:\/\/)([^/?#]*)(.*)$/is;

/**
 * Convert a domain, an e-mail address or a full URL.
 * For URLs only the hostname is converted; scheme, credentials, port, path, query and fragment are kept as-is.
 */
export function convertPunycode(input: string, direction: PunycodeDirection): string {
  const value = input.trim();
  const urlMatch = value.match(URL_REGEX);

  if (urlMatch) {
    // Throws for invalid URLs
    // eslint-disable-next-line no-new
    new URL(value);

    const [, scheme, authority, rest] = urlMatch;
    const atIndex = authority.lastIndexOf('@');
    const userInfo = atIndex >= 0 ? authority.slice(0, atIndex + 1) : '';
    const hostPort = authority.slice(atIndex + 1);
    if (hostPort.startsWith('[')) {
      // IPv6 literal: nothing to convert
      return `${scheme}${userInfo}${hostPort.toLowerCase()}${rest}`;
    }
    const portMatch = hostPort.match(/:\d*$/);
    const port = portMatch ? portMatch[0] : '';
    const host = port ? hostPort.slice(0, -port.length) : hostPort;
    return `${scheme}${userInfo}${convertHostname(host, direction)}${port}${rest}`;
  }

  const atIndex = value.lastIndexOf('@');
  if (atIndex >= 0) {
    return `${value.slice(0, atIndex + 1)}${convertHostname(value.slice(atIndex + 1), direction)}`;
  }

  return convertHostname(value, direction);
}
