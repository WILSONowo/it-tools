const DIGITS: Record<string, number> = {
  零: 0,
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

export function numberToRmbCapital(amount: number | string): string {
  const value = typeof amount === 'string' ? amount.trim() : String(amount);
  if (value === '') throw new Error('请输入金额');
  if (value.startsWith('-')) throw new Error('不支持负数');
  if (!/^\d+(\.\d{1,2})?$/.test(value)) throw new Error('金额格式错误(最多两位小数)');

  const [integerPartRaw = '0', decimalPartRaw = ''] = value.split('.');
  const integerPart = integerPartRaw.replace(/^0+/, '') || '0';
  if (integerPart.length > 15) throw new Error('金额过大(最多 15 位整数)');
  if (Number(integerPart) > Number.MAX_SAFE_INTEGER) throw new Error('金额过大(超出安全整数)');

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
    if (fen > 0) result += `${CN_DIGIT_CHAR[fen]}分`;
  }

  return result;
}

function integerToChinese(digits: string): string {
  const groups: string[] = [];
  for (let i = digits.length; i > 0; i -= 4) {
    groups.unshift(digits.slice(Math.max(0, i - 4), i));
  }

  let result = '';
  for (let g = 0; g < groups.length; g++) {
    const groupDigits = groups[g];
    const sectionValue = parseInt(groupDigits, 10);
    const sectionIndex = groups.length - 1 - g;
    if (sectionValue === 0) continue;

    if (result !== '' && sectionValue < 1000) {
      result += '零';
    }

    let groupText = '';
    for (let i = 0; i < groupDigits.length; i++) {
      const digit = Number(groupDigits[i]);
      const unitPos = groupDigits.length - 1 - i;
      if (digit === 0) {
        const nextNonZero = groupDigits
          .slice(i + 1)
          .split('')
          .some((c) => c !== '0');
        if (groupText !== '' && nextNonZero && !groupText.endsWith('零')) groupText += '零';
      } else {
        groupText += CN_DIGIT_CHAR[digit] + CN_SMALL_UNIT_CHAR[unitPos];
      }
    }
    if (groupText.endsWith('零')) groupText = groupText.slice(0, -1);

    result += groupText + CN_SECTION_CHAR[sectionIndex];
  }

  return result === '' ? '零' : result;
}

export function rmbCapitalToNumber(input: string): string {
  const cleaned = input.replace(/人民币/g, '').replace(/整|正/g, '');
  const match = cleaned.match(/^(.*?)(元|圆)(.*)$/);
  const intPart = match ? match[1] : cleaned;
  const decPart = match ? match[3] : '';

  let total = 0;
  if (intPart.trim() !== '') total = parseCnInteger(intPart);

  let decimal = 0;
  if (decPart) {
    const jiaoMatch = decPart.match(/[零〇一二两三四五六七八九壹贰叁肆伍陆柒捌玖]角/);
    const fenMatch = decPart.match(/[零〇一二两三四五六七八九壹贰叁肆伍陆柒捌玖]分/);
    if (jiaoMatch) decimal += (DIGITS[jiaoMatch[0][0]] ?? 0) * 0.1;
    if (fenMatch) decimal += (DIGITS[fenMatch[0][0]] ?? 0) * 0.01;
  }

  if (total === 0 && decimal === 0 && intPart.trim() === '') throw new Error('无法识别的大写金额');
  const value = total + decimal;
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0$/, '');
}

function parseCnInteger(text: string): number {
  const trimmed = text.trim();
  if (trimmed === '' || trimmed === '零') return 0;

  const parts: { value: number; unit: number }[] = [];
  let pending = '';
  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];
    const two = ch === '万' && trimmed[i + 1] === '亿' ? '万亿' : ch === '亿' && trimmed[i - 1] !== '万' ? '亿' : ch;
    if (ch === '万' && trimmed[i + 1] === '亿') {
      parts.push({ value: pending === '' ? 1 : parseSmallNumber(pending), unit: 1e12 });
      pending = '';
      i++;
    } else if (ch === '亿' && (i === 0 || trimmed[i - 1] !== '万')) {
      parts.push({ value: pending === '' ? 1 : parseSmallNumber(pending), unit: 1e8 });
      pending = '';
    } else if (ch === '万') {
      parts.push({ value: pending === '' ? 1 : parseSmallNumber(pending), unit: 1e4 });
      pending = '';
    } else {
      pending += ch;
    }
  }
  if (pending !== '') parts.push({ value: parseSmallNumber(pending), unit: 1 });

  let total = 0;
  for (const part of parts) total += part.value * part.unit;
  return total;
}

function parseSmallNumber(text: string): number {
  if (text === '' || text === '零') return 0;
  let total = 0;
  let current = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch in DIGITS) {
      current = DIGITS[ch];
      if (i === text.length - 1) total += current;
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
