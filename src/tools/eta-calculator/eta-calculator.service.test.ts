import { describe, expect, it } from 'vitest';
import { computeEtaDurationMs, computeEtaEnd, formatMsDuration } from './eta-calculator.service';

const base = { unitCount: 186, unitPerTimeSpan: 3, timeSpan: 5, timeSpanUnitMultiplier: 60000 };

describe('eta-calculator', () => {
  it('computes the total duration', () => {
    expect(computeEtaDurationMs(base)).toBe(310 * 60000);
    expect(formatMsDuration(310 * 60000)).toBe('5 小时 10 分钟');
  });

  it('returns null for cleared, zero or negative inputs', () => {
    expect(computeEtaDurationMs({ ...base, unitPerTimeSpan: null })).toBeNull();
    expect(computeEtaDurationMs({ ...base, timeSpan: null })).toBeNull();
    expect(computeEtaDurationMs({ ...base, unitCount: 0 })).toBeNull();
    expect(computeEtaDurationMs({ ...base, unitPerTimeSpan: -1 })).toBeNull();
  });

  it('returns null when the end date is not representable', () => {
    expect(computeEtaEnd(0, 1000)).toBe(1000);
    expect(computeEtaEnd(null, 1000)).toBeNull();
    expect(computeEtaEnd(0, null)).toBeNull();
    expect(computeEtaEnd(Date.now(), 1e20)).toBeNull();
  });
});
