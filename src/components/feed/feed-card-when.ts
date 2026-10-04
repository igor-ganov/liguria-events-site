import { branch } from '../../lib/branch.ts';
import { dateSpan } from '../../lib/events/date-span.ts';
import { escapeMarkup } from '../../lib/escape-markup.ts';
import type { CompactEvent } from '../../lib/events/event-schema.ts';

const hour = (event: CompactEvent): string =>
  branch(event.h === undefined)(
    () => '',
    () => `<b>${escapeMarkup(event.h ?? '')}</b>`,
  );

// The other hours the same thing starts that day. The first is already set
// large; repeating it here would make three starts read as four.
const more = (event: CompactEvent): string => {
  const rest = (event.hs ?? []).slice(1);
  return branch(rest.length === 0)(
    () => '',
    () => `<span class="photo-card-more">${escapeMarkup(rest.join(' · '))}</span>`,
  );
};

const run = (event: CompactEvent): string =>
  branch(event.e === undefined)(
    () => '',
    () => `<span>${escapeMarkup(dateSpan(event))}</span>`,
  );

/** The hour, set large because under a day heading it is the one number a
 *  reader is looking for; the other hours it starts that day; and the run of
 *  dates when the event has one. */
export const feedCardWhen = (event: CompactEvent): string =>
  `<span class="photo-card-when">${hour(event)}${more(event)}${run(event)}</span>`;
