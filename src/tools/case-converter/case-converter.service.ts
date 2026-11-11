import type { Options } from 'change-case';

/**
 * Characters that are NOT stripped: any letter (Latin, accented, CJK…) and any digit.
 * The default change-case regexp, and the previous one, removed digits and Chinese characters.
 */
export const caseConverterConfig: Options = {
  stripRegexp: /[^\p{L}\p{N}]+/gu,
};
