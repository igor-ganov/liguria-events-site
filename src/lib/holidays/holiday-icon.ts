import { holidayAccent } from './holiday-accent.ts';
import { LIGHT_SURFACES } from './light-surfaces.ts';
import { MOTIF_PATHS } from './motif-paths.ts';
import type { Holiday } from './decode-holidays.ts';

// public/favicon.svg, piece by piece: the pin, its colour and the wave inside.
const PIN = 'M16 1.6C8.6 1.6 2.6 7.5 2.6 14.9 2.6 24.4 16 38.4 16 38.4S29.4 24.4 29.4 14.9C29.4 7.5 23.4 1.6 16 1.6Z';
const SITE_ORANGE = '#f2822a';
const WAVE = '<path d="M8.2 16.4C10.7 12.7 13.6 12.7 16 16.4 18.4 20.1 21.3 20.1 23.8 16.4" stroke-width="2.7"/>';

// The motif's 24-unit grid, shrunk into the round head of the pin.
const motifOf = (paths: readonly string[]): string =>
  `<g transform="translate(8.8 7.6) scale(.6)" stroke-width="3.4">${paths.map((d) => `<path d="${d}"/>`).join('')}</g>`;

const insideOf = (holiday: Holiday): string =>
  [MOTIF_PATHS[holiday.theme.motif]].filter((paths) => paths.length > 0).map(motifOf).at(0) ?? WAVE;

/**
 * The tab icon a holiday wears: the site's pin in the holiday colour (the
 * site orange when that colour does not read on a light page) with the
 * holiday's motif drawn where the wave was. A data: URL, so it costs no request.
 */
export const holidayIcon = (holiday: Holiday): string => {
  const fill = holidayAccent(holiday.theme.accent, LIGHT_SURFACES) ?? SITE_ORANGE;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40"><path d="${PIN}" fill="${fill}"/>` +
    `<g fill="none" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round">${insideOf(holiday)}</g></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};
