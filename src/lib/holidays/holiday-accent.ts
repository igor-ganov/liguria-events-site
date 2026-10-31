import { contrastRatio } from '../a11y/contrast-ratio.ts';

const HEX = /^#[0-9a-f]{6}$/;
// WCAG AA for body text: the accent colours links and small labels.
const MIN_RATIO = 4.5;

/**
 * The holiday colour, when it is safe to paint with: exactly `#rrggbb` (it is
 * written into a style attribute, so nothing else may get through) and at least
 * 4.5:1 against every surface it lands on. Anything else is undefined, and the
 * site keeps its own accent.
 */
export const holidayAccent = (value: string, surfaces: readonly string[]): string | undefined =>
  [value.toLowerCase()]
    .filter((hex) => HEX.test(hex))
    .find((hex) => surfaces.every((surface) => contrastRatio(hex, surface) >= MIN_RATIO));
