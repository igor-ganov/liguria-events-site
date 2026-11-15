import { branch } from '../branch.ts';
import { eventSlug } from './event-slug.ts';
import type { CompactEvent } from './event-schema.ts';
import type { SessionSlot } from './session-slots.ts';

// The hours of a slot: the first one leads (it is what a day is sorted by), and
// the whole list rides along only when there is more than one to choose from.
const hoursOf = (times: readonly string[]): Partial<Pick<CompactEvent, 'h' | 'hs'>> => ({
  ...times.slice(0, 1).reduce((_, first) => ({ h: first }), {}),
  ...branch(times.length > 1)(
    () => ({ hs: times }),
    () => ({}),
  ),
});

/**
 * One occurrence of a container: a one-day event on the slot's date. The run
 * (`e`) and the programme (`p`) are cleared; the slot's own hours and title
 * (when named) override the umbrella's, and so does its title in the other
 * languages — the umbrella's localized title is dropped either way, so it can't
 * win. The address stays the umbrella's: that is the page a card for one night
 * opens.
 */
export const occurrenceOf = (event: CompactEvent, { session, times }: SessionSlot): CompactEvent => ({
  ...event,
  e: undefined,
  p: undefined,
  k: undefined,
  ad: eventSlug(event),
  s: session.date,
  ...hoursOf(times),
  ...branch(session.title === undefined)(
    () => ({}),
    () => ({ t: session.title ?? event.t, tl: session.titles }),
  ),
});
