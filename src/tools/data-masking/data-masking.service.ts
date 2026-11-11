// Every numeric rule is anchored with (?<!\d) … (?!\d) so it only matches a whole number,
// never a slice of a longer one (e.g. the middle of an ID card number).
// Rules run from most to least specific: ID card → phone → bank card.

// 18-digit mainland ID: keep the 6-digit region code and the last 4 characters,
// hide the birth date and sequence number.
const ID_CARD = /(?<![\dXx])(\d{6})\d{8}(\d{3}[\dXx])(?![\dXx])/g;

// Mainland mobile numbers, optionally with +86 / 86 and space or hyphen separators.
const PHONE = /(?<!\d)((?:\+?86[\s-]?)?1[3-9]\d)([\s-]?)\d{4}([\s-]?)(\d{4})(?!\d)/g;

// Bank cards: 13–19 digits, optionally grouped with spaces or hyphens.
const BANK_CARD = /(?<!\d)(\d{4})(?:[\s-]?\d){5,11}[\s-]?(\d{4})(?!\d)/g;

const EMAIL = /([a-zA-Z0-9._%+-])[a-zA-Z0-9._%+-]*(?=@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;

const IPV4 = /(?<![\d.])(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})(?![\d.])/g;

// Names are only masked where they are clearly names: after a label such as "姓名:" / "联系人",
// or when a line contains nothing but a 2–4 character Chinese name (a list of names).
// Masking every short run of Chinese characters would mangle ordinary text.
const NAME_LABELS = [
  '姓名',
  '联系人',
  '收件人',
  '收货人',
  '寄件人',
  '客户',
  '用户',
  '户名',
  '持卡人',
  '经办人',
  '负责人',
  '申请人',
  '患者',
  '学生',
  '员工',
  '法人',
  '法定代表人',
  '签字人',
  '联系人姓名',
].sort((a, b) => b.length - a.length);
// Up to 10 characters, allowing the "·" used in transliterated minority names.
const CHINESE_NAME = '[\\u4e00-\\u9fa5][\\u4e00-\\u9fa5·]{1,9}';
const LABELLED_NAME = new RegExp(
  `((?:${NAME_LABELS.join('|')})\\s*[:：]?\\s*)(${CHINESE_NAME})(?![\\u4e00-\\u9fa5·])`,
  'g',
);
const NAME_ONLY_LINE = /^(\s*)([一-龥]{2,4})(\s*)$/gm;

function hideName(name: string): string {
  return name[0] + '*'.repeat(name.length - 1);
}

function maskIdCard(value: string): string {
  return value.replace(ID_CARD, '$1********$2');
}

function maskPhone(value: string): string {
  return value.replace(PHONE, '$1$2****$3$4');
}

function maskBankCard(value: string): string {
  return value.replace(BANK_CARD, '$1 **** **** $2');
}

function maskEmail(value: string): string {
  return value.replace(EMAIL, '$1***');
}

function maskIp(value: string): string {
  return value.replace(IPV4, (match, a: string, b: string, c: string, d: string) =>
    [a, b, c, d].every((octet) => Number(octet) <= 255) ? `${a}.${b}.*.*` : match,
  );
}

function maskChineseName(value: string): string {
  return value
    .replace(LABELLED_NAME, (_, label: string, name: string) => label + hideName(name))
    .replace(NAME_ONLY_LINE, (_, before: string, name: string, after: string) => before + hideName(name) + after);
}

export const MASK_RULES = ['idcard', 'phone', 'card', 'email', 'ip', 'name'] as const;
export type MaskRule = (typeof MASK_RULES)[number];

const MASKERS: Record<MaskRule, (value: string) => string> = {
  idcard: maskIdCard,
  phone: maskPhone,
  card: maskBankCard,
  email: maskEmail,
  ip: maskIp,
  name: maskChineseName,
};

export function maskText(text: string, rules: string[]): string {
  // Apply in the fixed MASK_RULES order regardless of the order the rules were selected in.
  return MASK_RULES.filter((rule) => rules.includes(rule)).reduce((result, rule) => MASKERS[rule](result), text);
}
