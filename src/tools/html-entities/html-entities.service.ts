import { escape } from 'lodash';

export { escapeHtmlEntities, decodeHtmlEntities };

function escapeHtmlEntities(input: string) {
  return escape(input);
}

// Used when DOMParser is not available
const FALLBACK_NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: String.fromCharCode(0xa0),
  copy: String.fromCharCode(0xa9),
  reg: String.fromCharCode(0xae),
  trade: String.fromCharCode(0x2122),
  hellip: String.fromCharCode(0x2026),
  mdash: String.fromCharCode(0x2014),
  ndash: String.fromCharCode(0x2013),
  yen: String.fromCharCode(0xa5),
  euro: String.fromCharCode(0x20ac),
  middot: String.fromCharCode(0xb7),
  times: String.fromCharCode(0xd7),
  divide: String.fromCharCode(0xf7),
};

const namedEntityCache = new Map<string, string>();

function decodeNamedEntity(name: string): string | undefined {
  if (namedEntityCache.has(name)) {
    return namedEntityCache.get(name);
  }

  let decoded: string | undefined;
  if (typeof DOMParser !== 'undefined') {
    // Only "&name;" (letters and digits) is parsed, in an inert document: no markup, no script execution
    const text = new DOMParser().parseFromString(`&${name};`, 'text/html').documentElement.textContent ?? '';
    decoded = text === `&${name};` ? undefined : text;
  } else {
    decoded = FALLBACK_NAMED_ENTITIES[name];
  }

  namedEntityCache.set(name, decoded as string);
  return decoded;
}

function decodeCodePoint(codePoint: number) {
  if (
    Number.isNaN(codePoint) ||
    codePoint === 0 ||
    codePoint > 0x10ffff ||
    (codePoint >= 0xd800 && codePoint <= 0xdfff)
  ) {
    return String.fromCharCode(0xfffd);
  }
  return String.fromCodePoint(codePoint);
}

/** Decode named (&nbsp; &copy; …), decimal (&#20013;) and hexadecimal (&#x4e2d;) HTML entities. Unknown entities are kept as-is. */
function decodeHtmlEntities(input: string): string {
  return input.replace(/&(#\d+|#x[\da-f]+|[a-z][a-z\d]*);/gi, (match, body: string) => {
    if (body[0] === '#') {
      const isHex = body[1] === 'x' || body[1] === 'X';
      return decodeCodePoint(Number.parseInt(body.slice(isHex ? 2 : 1), isHex ? 16 : 10));
    }
    return decodeNamedEntity(body) ?? match;
  });
}
