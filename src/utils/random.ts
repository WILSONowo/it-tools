// All randomness here comes from the Web Crypto API (crypto.getRandomValues),
// so it is safe for passwords, tokens and keys.

const UINT32_RANGE = 0x1_0000_0000;

// Draw random values in batches: one getRandomValues call per 1024 numbers
// keeps bulk generation (thousands of passwords) fast.
const pool = new Uint32Array(1024);
let poolIndex = pool.length;

function randomUint32(): number {
  if (poolIndex >= pool.length) {
    crypto.getRandomValues(pool);
    poolIndex = 0;
  }
  return pool[poolIndex++];
}

/** Uniform float in [0, 1), like Math.random but cryptographically secure. */
const random = () => randomUint32() / UINT32_RANGE;

/**
 * Uniform integer in [0, max) without modulo bias (rejection sampling).
 * `max` must be an integer between 1 and 2^32.
 */
function secureRandomInt(max: number): number {
  if (!Number.isInteger(max) || max < 1 || max > UINT32_RANGE) {
    throw new RangeError(`secureRandomInt: invalid max ${max}`);
  }
  // Largest multiple of max that fits in the uint32 range; reject values above it.
  const limit = UINT32_RANGE - (UINT32_RANGE % max);
  let value = randomUint32();
  while (value >= limit) {
    value = randomUint32();
  }
  return value % max;
}

const randFromArray = <T>(array: T[]): T => array[secureRandomInt(array.length)];

// Inclusive on both ends: randIntFromInterval(0, 2) returns 0, 1 or 2.
const randIntFromInterval = (min: number, max: number) => {
  const span = max - min + 1;
  // Very large spans (beyond 2^32, e.g. timestamps) fall back to float scaling.
  return span <= UINT32_RANGE ? min + secureRandomInt(span) : Math.floor(random() * span + min);
};

/** Random string of `length` characters drawn independently from `alphabet`. */
function randomString(alphabet: string | string[], length: number): string {
  const chars = typeof alphabet === 'string' ? [...alphabet] : alphabet;
  if (chars.length === 0 || length <= 0) return '';
  let out = '';
  for (let i = 0; i < length; i++) {
    out += chars[secureRandomInt(chars.length)];
  }
  return out;
}

// Durstenfeld shuffle
const shuffleArrayMutate = <T>(array: T[]): T[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
};

const shuffleArray = <T>(array: T[]): T[] => shuffleArrayMutate([...array]);

const shuffleString = (str: string, delimiter = ''): string => shuffleArrayMutate(str.split(delimiter)).join(delimiter);

export {
  randFromArray,
  randIntFromInterval,
  random,
  randomString,
  secureRandomInt,
  shuffleArray,
  shuffleArrayMutate,
  shuffleString,
};
