import { formatInTimeZone, zonedTimeToUtc } from 'date-fns-tz';

export type TimestampType = 'seconds' | 'milliseconds' | 'auto';

/**
 * 自动识别阈值：|值| >= 1e11 视为毫秒，否则视为秒。
 * 1e11 秒约为公元 5138 年，1e11 毫秒约为 1973 年，
 * 因此该阈值能正确区分常见的秒级与毫秒级时间戳。
 */
export const AUTO_MS_THRESHOLD = 1e11;

export function autoToMs(value: number) {
  return Math.abs(value) >= AUTO_MS_THRESHOLD ? value : value * 1000;
}

export function resolveTimestampMs(input: string, type: TimestampType): number | null {
  const trimmed = input.trim();
  if (trimmed === '') {
    return null;
  }
  const value = Number(trimmed);
  if (Number.isNaN(value) || !Number.isFinite(value)) {
    return null;
  }
  if (type === 'milliseconds') {
    return value;
  }
  if (type === 'seconds') {
    return value * 1000;
  }
  return autoToMs(value);
}

export function formatInZone(ms: number, timeZone: string, pattern = 'yyyy-MM-dd HH:mm:ss xxx') {
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return formatInTimeZone(date, timeZone, pattern);
}

export function formatTimestampInZone(ms: number | null, timeZone: string) {
  if (ms === null) {
    return '';
  }
  const formatted = formatInZone(ms, timeZone);
  return formatted === '' ? '' : `${formatted} (${timeZone})`;
}

export function parseDateInZone(dateString: string, timeZone: string): number | null {
  const trimmed = dateString.trim();
  if (trimmed === '') {
    return null;
  }
  if (/^-?\d+$/.test(trimmed)) {
    return autoToMs(Number(trimmed));
  }
  const utc = zonedTimeToUtc(trimmed, timeZone);
  const time = utc.getTime();
  return Number.isNaN(time) ? null : time;
}
