import { DARK_SURFACES } from './dark-surfaces.ts';
import { LIGHT_SURFACES } from './light-surfaces.ts';
import { holidayAccent } from './holiday-accent.ts';
import { isDefined } from '../is-defined.ts';
import { pillImages } from './pill-images.ts';
import type { Holiday } from './decode-holidays.ts';

type Scheme = Readonly<{ name: 'light' | 'dark'; hex: string }>;

const schemesOf = (holiday: Holiday): readonly Scheme[] =>
  [
    [holidayAccent(holiday.theme.accent, LIGHT_SURFACES), 'light'] as const,
    [holidayAccent(holiday.theme.accentDark, DARK_SURFACES), 'dark'] as const,
  ].flatMap(([hex, name]) => [hex].filter(isDefined).map((kept) => ({ name, hex: kept })));

const varsOf = ({ name, hex }: Scheme): string => {
  const { fill, ring } = pillImages(hex);
  return `--holiday-${name}:${hex};--holiday-pill-${name}:${fill};--holiday-ring-${name}:${ring}`;
};

const themed = (holiday: Holiday): Readonly<Record<string, string>> => {
  const schemes = schemesOf(holiday);
  return {
    'data-holiday': holiday.id,
    ...Object.fromEntries(schemes.map(({ name }) => [`data-holiday-${name}`, ''])),
    ...Object.fromEntries([schemes.map(varsOf).join(';')].filter((style) => style !== '').map((style) => ['style', style])),
  };
};

/**
 * The attributes the `<html>` element carries on a holiday: its id (which the
 * motif and the chip hang off), one flag per theme whose colour passed, and
 * the colours themselves as custom properties that filo-tokens.css maps onto
 * the accent. A colour that failed leaves its theme on the site's own accent.
 */
export const holidayRootAttrs = (holiday: Holiday | undefined): Readonly<Record<string, string>> =>
  [holiday].filter(isDefined).map(themed).at(0) ?? {};
