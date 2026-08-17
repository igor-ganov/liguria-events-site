import { dayLabel } from '../../lib/favorites/day-label.ts';
import { escHtml } from './esc-html.ts';
import type { Locale } from '../../lib/i18n/locales.ts';

/** The "Saturday, 4 July → Monday, 6 July" line above a generated route. */
export const routeSpanHtml = (from: string, to: string, lang: Locale): string =>
  `<p class="route-span">${escHtml(dayLabel(from, lang))} → ${escHtml(dayLabel(to, lang))}</p>`;
