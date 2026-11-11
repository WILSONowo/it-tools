import { describe, expect, it } from 'vitest';
import { formatDateDifference } from './date-calculator.service';

describe('formatDateDifference', () => {
  it('counts whole calendar months', () => {
    expect(formatDateDifference(new Date(2023, 1, 1), new Date(2023, 2, 1))).toBe('0 年 1 个月 0 天 (共 28 天)');
    expect(formatDateDifference(new Date(2023, 0, 31), new Date(2023, 2, 1))).toBe('0 年 1 个月 1 天 (共 29 天)');
  });

  it('counts whole years', () => {
    expect(formatDateDifference(new Date(2024, 0, 1), new Date(2025, 0, 1))).toBe('1 年 0 个月 0 天 (共 366 天)');
  });

  it('is symmetric', () => {
    expect(formatDateDifference(new Date(2025, 0, 1), new Date(2024, 0, 1))).toBe('1 年 0 个月 0 天 (共 366 天)');
  });

  it('includes the time of day when present', () => {
    expect(formatDateDifference(new Date(2023, 0, 1, 8, 0), new Date(2023, 0, 3, 10, 30))).toBe(
      '0 年 0 个月 2 天 2 小时 30 分 (共 2 天)',
    );
  });

  it('handles identical and invalid dates', () => {
    expect(formatDateDifference(new Date(2023, 0, 1), new Date(2023, 0, 1))).toBe('同一时刻');
    expect(formatDateDifference(Number.NaN, new Date(2023, 0, 1))).toBe('');
  });
});
