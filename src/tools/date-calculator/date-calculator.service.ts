import { differenceInDays, intervalToDuration } from 'date-fns';

/**
 * Human readable difference between two dates, using real calendar months/years
 * (2023-02-01 → 2023-03-01 is exactly 1 month, not "1 month -2 days").
 */
export function formatDateDifference(a: Date | number, b: Date | number): string {
  const first = new Date(a);
  const second = new Date(b);
  if (Number.isNaN(first.getTime()) || Number.isNaN(second.getTime())) return '';
  if (first.getTime() === second.getTime()) return '同一时刻';

  const [start, end] = first < second ? [first, second] : [second, first];
  const { years = 0, months = 0, days = 0, hours = 0, minutes = 0 } = intervalToDuration({ start, end });
  const totalDays = differenceInDays(end, start);

  const time = hours || minutes ? ` ${hours} 小时 ${minutes} 分` : '';
  return `${years} 年 ${months} 个月 ${days} 天${time} (共 ${totalDays} 天)`;
}
