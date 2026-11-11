const charsetClasses: { label: string; regex: RegExp; weight: number }[] = [
  { label: 'lowercase', regex: /[a-z]/, weight: 26 },
  { label: 'uppercase', regex: /[A-Z]/, weight: 26 },
  { label: 'number', regex: /\d/, weight: 10 },
  { label: 'symbol', regex: /[^A-Za-z0-9]/, weight: 33 },
];

// 按流行程度大致排序,排名越靠前猜测成本越低
const commonPasswords = [
  'password',
  '123456',
  '123456789',
  '12345678',
  '12345',
  'qwerty',
  '1234567',
  '111111',
  '1234567890',
  '000000',
  'abc123',
  'password1',
  'iloveyou',
  '123123',
  'admin',
  'woaini',
  '5201314',
  '666666',
  '888888',
  'qwerty123',
  '1q2w3e4r',
  'monkey',
  'dragon',
  'letmein',
  'welcome',
  'login',
  'master',
  'sunshine',
  'princess',
  'football',
  'baseball',
  'shadow',
  'superman',
  'michael',
  'trustno1',
  'passw0rd',
  'qazwsx',
  'zaq12wsx',
  'ashley',
  'bailey',
  'starwars',
  'whatever',
  'hello',
  'love',
  'secret',
  'computer',
  'internet',
  'root',
  'test',
  'guest',
  'user',
  'pass',
  'summer',
  'winter',
  'spring',
  'autumn',
  'china',
  'aini',
  'qwe',
  'asd',
  'abc',
];
const commonPasswordRank = new Map(commonPasswords.map((word, index) => [word, index]));
const maxCommonLength = Math.max(...commonPasswords.map((word) => word.length));

const leetMap: Record<string, string> = {
  '@': 'a',
  '4': 'a',
  '3': 'e',
  '1': 'i',
  '!': 'i',
  '0': 'o',
  $: 's',
  '5': 's',
  '7': 't',
  '+': 't',
};

const keyboardRows = [
  '`1234567890-=',
  'qwertyuiop[]\\',
  "asdfghjkl;'",
  'zxcvbnm,./',
  '~!@#$%^&*()_+',
  '1qaz2wsx3edc4rfv5tgb6yhn7ujm8ik,9ol.0p;/',
];

export type PasswordPatternKind = 'dictionary' | 'sequence' | 'keyboard' | 'repeat' | 'year';

export interface PasswordPattern {
  kind: PasswordPatternKind;
  token: string;
  start: number;
  end: number; // exclusive
  bits: number;
}

export const patternLabels: Record<PasswordPatternKind, string> = {
  dictionary: '常见密码/单词',
  sequence: '连续字符',
  keyboard: '键盘相邻键',
  repeat: '重复字符',
  year: '年份',
};

const MAX_ANALYZED_LENGTH = 256;

function charsetPoolSize(password: string): number {
  return charsetClasses.reduce((pool, { regex, weight }) => (regex.test(password) ? pool + weight : pool), 0) || 1;
}

function capitalizationBits(token: string): number {
  const upper = [...token].filter((c) => c >= 'A' && c <= 'Z').length;
  if (upper === 0) return 0;
  if (upper === token.length || (upper === 1 && token[0] >= 'A' && token[0] <= 'Z')) return 1;
  return upper;
}

function findDictionaryMatches(password: string): PasswordPattern[] {
  const matches: PasswordPattern[] = [];
  const lower = password.toLowerCase();
  const unleet = [...lower].map((c) => leetMap[c] ?? c).join('');

  for (let i = 0; i < password.length; i++) {
    for (let j = i + 3; j <= Math.min(password.length, i + maxCommonLength); j++) {
      const candidates = [
        { word: lower.slice(i, j), leetBits: 0 },
        { word: unleet.slice(i, j), leetBits: [...lower.slice(i, j)].filter((c) => c in leetMap).length },
      ];
      for (const { word, leetBits } of candidates) {
        const rank = commonPasswordRank.get(word);
        if (rank !== undefined) {
          const token = password.slice(i, j);
          matches.push({
            kind: 'dictionary',
            token,
            start: i,
            end: j,
            bits: Math.log2(rank + 2) + capitalizationBits(token) + leetBits,
          });
          break;
        }
      }
    }
  }
  return matches;
}

function charClass(c: string): string {
  if (c >= '0' && c <= '9') return 'digit';
  if (c >= 'a' && c <= 'z') return 'lower';
  if (c >= 'A' && c <= 'Z') return 'upper';
  return 'other';
}

function findSequenceMatches(password: string): PasswordPattern[] {
  const matches: PasswordPattern[] = [];
  let i = 0;
  while (i < password.length - 2) {
    const delta = password.charCodeAt(i + 1) - password.charCodeAt(i);
    const cls = charClass(password[i]);
    let j = i + 1;
    if (Math.abs(delta) === 1 && cls !== 'other') {
      while (
        j < password.length &&
        password.charCodeAt(j) - password.charCodeAt(j - 1) === delta &&
        charClass(password[j]) === cls
      ) {
        j++;
      }
    }
    if (j - i >= 3) {
      const token = password.slice(i, j);
      matches.push({
        kind: 'sequence',
        token,
        start: i,
        end: j,
        bits: Math.log2(cls === 'digit' ? 10 : 26) + 1 + Math.log2(token.length),
      });
      i = j - 1;
    } else {
      i++;
    }
  }
  return matches;
}

function findKeyboardMatches(password: string): PasswordPattern[] {
  const matches: PasswordPattern[] = [];
  const lower = password.toLowerCase();
  const rows = keyboardRows.flatMap((row) => [row, [...row].reverse().join('')]);

  for (let i = 0; i < lower.length - 2; i++) {
    let best = 0;
    for (let j = i + 3; j <= lower.length; j++) {
      const sub = lower.slice(i, j);
      if (rows.some((row) => row.includes(sub))) {
        best = j;
      } else {
        break;
      }
    }
    if (best) {
      const token = password.slice(i, best);
      matches.push({
        kind: 'keyboard',
        token,
        start: i,
        end: best,
        bits: Math.log2(94) + Math.log2(token.length) + capitalizationBits(token),
      });
    }
  }
  return matches;
}

function findRepeatMatches(password: string, pool: number, cache: Map<string, number>): PasswordPattern[] {
  const matches: PasswordPattern[] = [];
  for (let i = 0; i < password.length; i++) {
    for (let size = 1; i + size * 2 <= password.length; size++) {
      const base = password.slice(i, i + size);
      let count = 1;
      while (password.startsWith(base, i + size * count)) {
        count++;
      }
      const length = size * count;
      if (count >= 2 && length >= 3) {
        matches.push({
          kind: 'repeat',
          token: password.slice(i, i + length),
          start: i,
          end: i + length,
          // 重复的部分只算一次,再加上重复次数的信息量
          bits: baseEntropy(base, pool, cache) + Math.log2(count),
        });
      }
    }
  }
  return matches;
}

function findYearMatches(password: string): PasswordPattern[] {
  const matches: PasswordPattern[] = [];
  const regex = /(?:19|20)\d\d/g;
  let match: RegExpExecArray | null = regex.exec(password);
  while (match) {
    matches.push({ kind: 'year', token: match[0], start: match.index, end: match.index + 4, bits: Math.log2(200) });
    regex.lastIndex = match.index + 1;
    match = regex.exec(password);
  }
  return matches;
}

function baseEntropy(base: string, pool: number, cache: Map<string, number>): number {
  const cached = cache.get(base);
  if (cached !== undefined) return cached;
  const bits = minimumEntropy(base, pool, cache).bits;
  cache.set(base, bits);
  return bits;
}

/**
 * 简化版的 zxcvbn 思路:把密码切分为「随机字符」与「可预测模式」(常见密码、连续字符、
 * 键盘相邻键、重复、年份),用动态规划求总熵最小的切分方式。
 */
function minimumEntropy(
  password: string,
  pool: number,
  cache: Map<string, number>,
): { bits: number; patterns: PasswordPattern[] } {
  const n = password.length;
  const charBits = Math.log2(pool);
  const matches = [
    ...findDictionaryMatches(password),
    ...findSequenceMatches(password),
    ...findKeyboardMatches(password),
    ...findYearMatches(password),
    ...(n <= 64 ? findRepeatMatches(password, pool, cache) : []),
  ];

  const best: { bits: number; pattern?: PasswordPattern; prev: number }[] = [{ bits: 0, prev: -1 }];
  for (let end = 1; end <= n; end++) {
    best[end] = { bits: best[end - 1].bits + charBits, prev: end - 1 };
    for (const match of matches) {
      if (match.end === end && best[match.start].bits + match.bits < best[end].bits) {
        best[end] = { bits: best[match.start].bits + match.bits, pattern: match, prev: match.start };
      }
    }
  }

  const patterns: PasswordPattern[] = [];
  for (let i = n; i > 0; i = best[i].prev) {
    const { pattern } = best[i];
    if (pattern) patterns.unshift(pattern);
  }

  return { bits: best[n].bits, patterns };
}

export function analyzePassword(password: string): { entropy: number; patterns: PasswordPattern[] } {
  if (password.length === 0) return { entropy: 0, patterns: [] };

  const pool = charsetPoolSize(password);
  if (password.length > MAX_ANALYZED_LENGTH) {
    // 超长密码只按字符集估算,避免模式匹配耗时过长(此时熵早已远超任何破解能力)
    return { entropy: password.length * Math.log2(pool), patterns: [] };
  }

  const { bits, patterns } = minimumEntropy(password, pool, new Map());
  return { entropy: bits, patterns };
}

export function estimateEntropy(password: string): number {
  return analyzePassword(password).entropy;
}

/** 0~100 分;以扣除可预测模式后的熵为准:约 27 位以下为弱,72 位以上为强 */
export function scoreFromEntropy(entropyBits: number): number {
  return Math.max(0, Math.min(100, Math.round(entropyBits / 0.9)));
}

export function scorePassword(password: string): number {
  if (password.length === 0) return 0;

  return scoreFromEntropy(estimateEntropy(password));
}

const guessesPerSecond = 1e10;
const SECONDS_PER_YEAR = 31536000;
const MAX_DISPLAY_YEARS = 1e8;

export function timeToCrackLabel(entropyBits: number): string {
  // 先在对数空间比较,避免 2^bits 溢出为 Infinity
  if (entropyBits >= Math.log2(MAX_DISPLAY_YEARS * SECONDS_PER_YEAR * guessesPerSecond)) {
    return '超过 1 亿年';
  }

  const seconds = Math.pow(2, entropyBits) / guessesPerSecond;

  if (seconds < 60) return '瞬时';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} 分钟`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} 小时`;
  if (seconds < SECONDS_PER_YEAR) return `${Math.floor(seconds / 86400)} 天`;

  const years = seconds / SECONDS_PER_YEAR;
  if (years < 1e4) return `${Math.floor(years)} 年`;
  return `${Math.floor(years / 1e4)} 万年`;
}
