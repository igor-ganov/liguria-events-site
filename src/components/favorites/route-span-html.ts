import { branch } from '../../lib/branch.ts';
import { dayLabel } from '../../lib/favorites/day-label.ts';
import { escHtml } from './esc-html.ts';
import type { Locale } from '../../lib/i18n/locales.ts';

/**
 * The "Saturday, 4 July → Monday, 6 July" line above a generated route — or
 * just the one day, when that is all the route covers. A single day written
 * twice with an arrow between reads as something that failed to fill in.
 */
export const routeSpanHtml = (from: string, to: string, lang: Locale): string => {
  const day = (iso: string): string => escHtml(dayLabel(iso, lang));
  const text = branch(from === to)(
    () => day(from),
    () => `${day(from)} → ${day(to)}`,
  );
  return `<p class="route-span">${text}</p>`;
};
