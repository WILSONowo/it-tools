const commonPatterns: { label: string; regex: RegExp; weight: number }[] = [
  { label: 'lowercase', regex: /[a-z]/, weight: 26 },
  { label: 'uppercase', regex: /[A-Z]/, weight: 26 },
  { label: 'number', regex: /\d/, weight: 10 },
  { label: 'symbol', regex: /[^A-Za-z0-9]/, weight: 33 },
];

const commonPasswords = new Set([
  'password',
  '123456',
  '12345678',
  'qwerty',
  'abc123',
  'monkey',
  '1234567',
  'letmein',
  'trustno1',
  'dragon',
  'baseball',
  'iloveyou',
  'master',
  'sunshine',
  'ashley',
  'bailey',
  'passw0rd',
  'shadow',
  '123123',
  '654321',
  'superman',
  'qazwsx',
  'michael',
  'football',
]);

export function estimateEntropy(password: string): number {
  if (password.length === 0) return 0;

  let poolSize = 0;
  for (const { regex, weight } of commonPatterns) {
    if (regex.test(password)) {
      poolSize += weight;
    }
  }

  return password.length * Math.log2(poolSize || 1);
}

export function scorePassword(password: string): number {
  if (password.length === 0) return 0;

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  let score = 0;

  score += Math.min(40, password.length * 4);
  score += hasLower && hasUpper ? 10 : 0;
  score += hasNumber ? 10 : 0;
  score += hasSymbol ? 15 : 0;
  if (hasUpper && hasNumber && hasSymbol) score += 10;

  const charCounts = new Map<string, number>();
  for (const char of password) {
    charCounts.set(char, (charCounts.get(char) ?? 0) + 1);
  }
  const repeats = [...charCounts.values()].filter((count) => count > 1).reduce((sum, count) => sum + count - 1, 0);
  score -= Math.min(20, repeats * 3);

  const lowerPassword = password.toLowerCase();
  for (const common of commonPasswords) {
    if (lowerPassword.includes(common)) {
      score -= 25;
      break;
    }
  }

  const sequences = /(?:0123456789|9876543210|abcdefghijklmnopqrstuvwxyz|qwertyuiop|asdfghjkl|zxcvbnm)/i;
  if (sequences.test(password)) {
    score -= 15;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

const guessesPerSecond = 1e10;

export function timeToCrackLabel(entropyBits: number): string {
  const seconds = Math.pow(2, entropyBits) / guessesPerSecond;

  if (seconds < 60) return '瞬时';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} 分钟`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} 小时`;
  if (seconds < 31536000) return `${Math.floor(seconds / 86400)} 天`;
  if (seconds < 31536000 * 1000) return `${Math.floor(seconds / 31536000)} 年`;

  return `${(seconds / 31536000 / 1000).toFixed(1)}k 年`;
}
