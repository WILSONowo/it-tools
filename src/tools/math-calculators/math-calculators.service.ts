/** Parse a list of numbers separated by commas, semicolons or whitespace. Empty and non-numeric tokens are ignored. */
export function parseNumbers(text: string): number[] {
  return text
    .split(/[,\s;]+/)
    .filter((token) => token !== '')
    .map(Number)
    .filter((n) => !Number.isNaN(n));
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x;
}

/** Least common multiple; 0 when any operand is 0 (0 is a multiple of everything). */
export function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs((a / gcd(a, b)) * b);
}

export function gcdLcm(numbers: number[]): { gcd: number; lcm: number } | null {
  if (numbers.length === 0) return null;
  return { gcd: numbers.reduce(gcd), lcm: numbers.reduce(lcm) };
}
