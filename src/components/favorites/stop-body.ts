import { escHtml } from './esc-html.ts';
import { when } from './when.ts';
import { eventDuration, formatDuration } from '../../lib/favorites/event-duration.ts';
import { titleOf } from '../../lib/events/title-of.ts';
import { eventPath } from '../../lib/event-path.ts';
import { localizedUrl } from '../../lib/i18n/localized-url.ts';
import type { RouteStop } from '../../lib/favorites/build-route.ts';
import type { Locale } from '../../lib/i18n/locales.ts';
import type { Durations } from './render-types.ts';

const durationCell = (id: string, dur: number): string =>
  `<span class="route-stop-dur" title="Duration">⏱ ${escHtml(formatDuration(dur))} ` +
  `<input type="number" class="dur-input" data-dur-input data-dur-id="${escHtml(id)}" ` +
  `value="${dur}" min="15" step="15" aria-label="Duration in minutes" /></span>`;

/** The stop's inner content (title + meta), shared by the read-only itinerary
 *  and the owner editor, which each wrap it with their own <li>/controls. */
export const stopBody = (event: RouteStop, lang: Locale, overrides: Durations): string =>
  `<div><a href="${event.href ?? localizedUrl(lang, eventPath(event))}">${escHtml(titleOf(lang)(event))}</a>` +
  `<div class="route-stop-meta">` +
  when(Boolean(event.h), `<span class="route-stop-time">${escHtml(event.h ?? '')}</span>`) +
  when(Boolean(event.v), `<span class="route-stop-venue">${escHtml(event.v ?? '')}</span>`) +
  durationCell(event.id, eventDuration(event, overrides[event.id])) +
  `</div></div>`;
