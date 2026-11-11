const DIGITS: Record<string, number> = {
  零: 0,
  〇: 0,
  一: 1,
  二: 2,
  两: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
  壹: 1,
  贰: 2,
  叁: 3,
  肆: 4,
  伍: 5,
  陆: 6,
  柒: 7,
  捌: 8,
  玖: 9,
};
const SMALL_UNITS: Record<string, number> = { 拾: 10, 佰: 100, 仟: 1000, 十: 10, 百: 100, 千: 1000 };
const CN_DIGIT_CHAR = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
const CN_SMALL_UNIT_CHAR = ['', '拾', '佰', '仟'];
const CN_SECTION_CHAR = ['', '万', '亿', '万亿'];
const DIGIT_CLASS = '零〇一二两三四五六七八九壹贰叁肆伍陆柒捌玖';
const DECIMAL_REGEX = new RegExp(`^[零〇]?(?:([${DIGIT_CLASS}])角)?[零〇]?(?:([${DIGIT_CLASS}])分)?$`);

export function numberToRmbCapital(amount: number | string): string {
  const value = typeof amount === 'string' ? amount.trim() : String(amount);
  if (value === '') {
    throw new Error('请输入金额');
  }
  if (value.startsWith('-')) {
    throw new Error('不支持负数');
  }
  if (!/^\d+(\.\d{1,2})?$/.test(value)) {
    throw new Error('金额格式错误(最多两位小数)');
  }

  const [integerPartRaw = '0', decimalPartRaw = ''] = value.split('.');
  const integerPart = integerPartRaw.replace(/^0+/, '') || '0';
  if (integerPart.length > 15) {
    throw new Error('金额过大(最多 15 位整数)');
  }

  const decimalPart = decimalPartRaw.padEnd(2, '0');
  const intText = integerPart === '0' ? '零' : integerToChinese(integerPart);

  let result = `${intText}元`;
  const jiao = Number(decimalPart[0]);
  const fen = Number(decimalPart[1] ?? '0');

  if (jiao === 0 && fen === 0) {
    result += '整';
  } else if (jiao === 0) {
    result += `零${CN_DIGIT_CHAR[fen]}分`;
  } else {
    result += `${CN_DIGIT_CHAR[jiao]}角`;
    if (fen > 0) {
      result += `${CN_DIGIT_CHAR[fen]}分`;
    }
  }

  return result;
}

function integerToChinese(digits: string): string {
  const groups: string[] = [];
  for (let i = digits.length; i > 0; i -= 4) {
    groups.unshift(digits.slice(Math.max(0, i - 4), i));
  }

  let result = '';
  // A whole 4-digit section of zeros was skipped since the last written section (e.g. 1 0000 1000)
  let skippedZeroSection = false;
  for (let g = 0; g < groups.length; g++) {
    const groupDigits = groups[g];
    const sectionValue = Number.parseInt(groupDigits, 10);
    const sectionIndex = groups.length - 1 - g;
    if (sectionValue === 0) {
      if (result !== '') {
        skippedZeroSection = true;
      }
      continue;
    }

    if (result !== '' && (sectionValue < 1000 || skippedZeroSection)) {
      result += '零';
    }
    skippedZeroSection = false;

    let groupText = '';
    for (let i = 0; i < groupDigits.length; i++) {
      const digit = Number(groupDigits[i]);
      const unitPos = groupDigits.length - 1 - i;
      if (digit === 0) {
        const nextNonZero = groupDigits
          .slice(i + 1)
          .split('')
          .some((c) => c !== '0');
        if (groupText !== '' && nextNonZero && !groupText.endsWith('零')) {
          groupText += '零';
        }
      } else {
        groupText += CN_DIGIT_CHAR[digit] + CN_SMALL_UNIT_CHAR[unitPos];
      }
    }

    result += groupText + CN_SECTION_CHAR[sectionIndex];
  }

  return result === '' ? '零' : result;
}

export function rmbCapitalToNumber(input: string): string {
  const cleaned = input
    .replace(/\s/g, '')
    .replace(/人民币|¥|￥/g, '')
    .replace(/[整正]$/, '');
  const match = cleaned.match(/^(.*?)[元圆](.*)$/);
  let intPart = match ? match[1] : cleaned;
  let decPart = match ? match[2] : '';
  // e.g. "贰角" / "伍分": no 元 at all
  if (!match && /[角分]/.test(cleaned)) {
    intPart = '';
    decPart = cleaned;
  }

  if (intPart === '' && decPart === '') {
    throw new Error('无法识别的大写金额');
  }

  const decimalMatch = decPart.match(DECIMAL_REGEX);
  if (!decimalMatch) {
    throw new Error('无法识别的角/分部分');
  }
  const jiao = decimalMatch[1] ? DIGITS[decimalMatch[1]] : 0;
  const fen = decimalMatch[2] ? DIGITS[decimalMatch[2]] : 0;

  // Work in integer fen with BigInt to avoid floating point errors
  const totalFen = parseCnInteger(intPart) * BigInt(100) + BigInt(jiao * 10 + fen);
  const yuan = totalFen / BigInt(100);
  const cents = Number(totalFen % BigInt(100));
  if (cents === 0) {
    return yuan.toString();
  }
  return `${yuan}.${String(cents).padStart(2, '0').replace(/0$/, '')}`;
}

function parseCnInteger(text: string): bigint {
  const trimmed = text.trim();
  if (trimmed === '' || trimmed === '零') {
    return BigInt(0);
  }

  const parts: { value: number; unit: bigint }[] = [];
  let pending = '';
  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (ch === '万' && trimmed[i + 1] === '亿') {
      parts.push({ value: pending === '' ? 1 : parseSmallNumber(pending), unit: BigInt('1000000000000') });
      pending = '';
      i++;
    } else if (ch === '亿') {
      parts.push({ value: pending === '' ? 1 : parseSmallNumber(pending), unit: BigInt(100000000) });
      pending = '';
    } else if (ch === '万') {
      parts.push({ value: pending === '' ? 1 : parseSmallNumber(pending), unit: BigInt(10000) });
      pending = '';
    } else {
      pending += ch;
    }
  }
  if (pending !== '') {
    parts.push({ value: parseSmallNumber(pending), unit: BigInt(1) });
  }

  return parts.reduce((total, part) => total + BigInt(part.value) * part.unit, BigInt(0));
}

function parseSmallNumber(text: string): number {
  if (text === '' || text === '零') {
    return 0;
  }
  let total = 0;
  let current = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch in DIGITS) {
      current = DIGITS[ch];
      if (i === text.length - 1) {
        total += current;
      }
    } else if (ch in SMALL_UNITS) {
      const unit = SMALL_UNITS[ch];
      const digit = current === 0 && unit === 10 ? 1 : current;
      total += digit * unit;
      current = 0;
    } else {
      throw new Error('无法识别的大写金额');
    }
  }
  return total;
}
