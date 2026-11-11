// Duplicate issue with sub directory
// eslint-disable-next-line import/no-duplicates
import { formatDuration } from 'date-fns';
// eslint-disable-next-line import/no-duplicates
import { zhCN } from 'date-fns/locale';

export function formatMsDuration(duration: number) {
  const ms = Math.floor(duration % 1000);
  const secs = Math.floor(((duration - ms) / 1000) % 60);
  const mins = Math.floor((((duration - ms) / 1000 - secs) / 60) % 60);
  const hrs = Math.floor((((duration - ms) / 1000 - secs) / 60 - mins) / 60);

  return (
    formatDuration(
      {
        hours: hrs,
        minutes: mins,
        seconds: secs,
      },
      { locale: zhCN },
    ) + (ms > 0 ? ` ${ms} 毫秒` : '')
  );
}

const isPositive = (value: number | null | undefined): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0;

/**
 * Total duration in ms to consume `unitCount` units at `unitPerTimeSpan` units per `timeSpan * timeSpanUnitMultiplier` ms.
 * Returns `null` when an input is empty (cleared n-input-number gives null), zero or negative.
 */
export function computeEtaDurationMs({
  unitCount,
  unitPerTimeSpan,
  timeSpan,
  timeSpanUnitMultiplier,
}: {
  unitCount: number | null;
  unitPerTimeSpan: number | null;
  timeSpan: number | null;
  timeSpanUnitMultiplier: number | null;
}): number | null {
  if (
    !isPositive(unitCount) ||
    !isPositive(unitPerTimeSpan) ||
    !isPositive(timeSpan) ||
    !isPositive(timeSpanUnitMultiplier)
  ) {
    return null;
  }

  const duration = (unitCount * timeSpan * timeSpanUnitMultiplier) / unitPerTimeSpan;
  return Number.isFinite(duration) ? duration : null;
}

// Largest timestamp a JS Date can represent
const MAX_DATE_MS = 8.64e15;

/** End timestamp, or `null` when it cannot be represented as a Date. */
export function computeEtaEnd(startedAt: number | null, durationMs: number | null): number | null {
  if (startedAt === null || durationMs === null) return null;
  const end = startedAt + durationMs;
  return Number.isFinite(end) && Math.abs(end) <= MAX_DATE_MS ? end : null;
}
