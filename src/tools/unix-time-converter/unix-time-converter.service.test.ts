import { describe, expect, it } from 'vitest';
import { formatTimestampInZone, parseDateInZone, resolveTimestampMs } from './unix-time-converter.service';

describe('unix-time-converter', () => {
  describe('resolveTimestampMs', () => {
    it('auto-detects seconds vs milliseconds with a 1e11 threshold', () => {
      expect(resolveTimestampMs('1700000000', 'auto')).toBe(1700000000000);
      expect(resolveTimestampMs('1700000000123', 'auto')).toBe(1700000000123);
      expect(resolveTimestampMs('99999999999', 'auto')).toBe(99999999999000);
      expect(resolveTimestampMs('100000000000', 'auto')).toBe(100000000000);
    });

    it('respects explicit types and rejects invalid input', () => {
      expect(resolveTimestampMs('1700000000', 'milliseconds')).toBe(1700000000);
      expect(resolveTimestampMs('1700000000123', 'seconds')).toBe(1700000000123000);
      expect(resolveTimestampMs('abc', 'auto')).toBeNull();
      expect(resolveTimestampMs('  ', 'auto')).toBeNull();
    });
  });

  describe('formatTimestampInZone', () => {
    it('shows the offset of the selected time zone, not the browser one', () => {
      expect(formatTimestampInZone(1700000000000, 'UTC')).toBe('2023-11-14 22:13:20 +00:00 (UTC)');
      expect(formatTimestampInZone(1700000000000, 'Asia/Shanghai')).toBe('2023-11-15 06:13:20 +08:00 (Asia/Shanghai)');
      expect(formatTimestampInZone(1700000000000, 'America/New_York')).toBe(
        '2023-11-14 17:13:20 -05:00 (America/New_York)',
      );
    });

    it('returns empty string for null or invalid dates', () => {
      expect(formatTimestampInZone(null, 'UTC')).toBe('');
      expect(formatTimestampInZone(1e20, 'UTC')).toBe('');
    });
  });

  describe('parseDateInZone', () => {
    it('interprets the date in the selected zone', () => {
      expect(parseDateInZone('2023-11-15 00:00:00', 'Asia/Shanghai')).toBe(Date.UTC(2023, 10, 14, 16));
      expect(parseDateInZone('2023-11-15 00:00:00', 'UTC')).toBe(Date.UTC(2023, 10, 15));
    });

    it('accepts raw timestamps', () => {
      expect(parseDateInZone('1700000000', 'UTC')).toBe(1700000000000);
      expect(parseDateInZone('1700000000123', 'UTC')).toBe(1700000000123);
    });

    it('returns null for garbage', () => {
      expect(parseDateInZone('not a date', 'UTC')).toBeNull();
    });
  });
});
