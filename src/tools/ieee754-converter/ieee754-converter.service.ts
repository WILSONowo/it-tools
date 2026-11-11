export type Ieee754Kind = 'zero' | 'subnormal' | 'normal' | 'infinity' | 'nan';

export interface Ieee754Encoding {
  bits: string;
  hex: string;
  sign: string;
  exponentBits: string;
  /** Human readable exponent (unbiased), with an explanation for special encodings */
  exponent: string;
  mantissaBits: string;
  kind: Ieee754Kind;
  /** The value actually stored after rounding to this precision */
  storedValue: string;
  /** True when a finite input became ±Infinity because it does not fit this format */
  overflow: boolean;
}

/**
 * Parse the user input. Accepts regular numbers (`3.14`, `-0`, `1e10`) and the special values
 * `NaN`, `Infinity`, `+Infinity`, `-Infinity` (`inf` is accepted as a shorthand).
 * Returns `null` for invalid input.
 */
export function parseFloatInput(input: string): number | null {
  const raw = input.trim();
  if (raw === '') return null;
  if (/^nan$/i.test(raw)) return Number.NaN;
  const infinity = /^([+-]?)(infinity|inf)$/i.exec(raw);
  if (infinity) return infinity[1] === '-' ? -Infinity : Infinity;

  const value = Number(raw);
  return Number.isNaN(value) ? null : value;
}

function formatStoredValue(value: number): string {
  if (Object.is(value, -0)) return '-0';
  return String(value);
}

export function encodeIeee754(value: number, double: boolean): Ieee754Encoding {
  const view = new DataView(new ArrayBuffer(8));
  let raw: string;
  let stored: number;
  if (double) {
    view.setFloat64(0, value);
    stored = view.getFloat64(0);
    raw = view.getUint32(0).toString(2).padStart(32, '0') + view.getUint32(4).toString(2).padStart(32, '0');
  } else {
    view.setFloat32(0, value);
    stored = view.getFloat32(0);
    raw = view.getUint32(0).toString(2).padStart(32, '0');
  }

  const exponentLength = double ? 11 : 8;
  const bias = double ? 1023 : 127;
  const sign = raw[0];
  const exponentBits = raw.slice(1, 1 + exponentLength);
  const mantissaBits = raw.slice(1 + exponentLength);
  const biased = parseInt(exponentBits, 2);
  const mantissaIsZero = !mantissaBits.includes('1');

  let kind: Ieee754Kind;
  let exponent: string;
  if (biased === 0) {
    kind = mantissaIsZero ? 'zero' : 'subnormal';
    exponent = mantissaIsZero ? '0(零)' : `0(非规格化数,指数按 ${1 - bias} 计)`;
  } else if (biased === 2 ** exponentLength - 1) {
    kind = mantissaIsZero ? 'infinity' : 'nan';
    exponent = mantissaIsZero ? '特殊值(Infinity)' : '特殊值(NaN)';
  } else {
    kind = 'normal';
    exponent = String(biased - bias);
  }

  return {
    bits: raw,
    hex: `0x${parseInt(raw.slice(0, 32), 2).toString(16).padStart(8, '0')}${
      double ? parseInt(raw.slice(32), 2).toString(16).padStart(8, '0') : ''
    }`,
    sign,
    exponentBits,
    exponent,
    mantissaBits,
    kind,
    storedValue: formatStoredValue(stored),
    overflow: Number.isFinite(value) && !Number.isFinite(stored),
  };
}
