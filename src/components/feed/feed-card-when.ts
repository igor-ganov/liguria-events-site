import { branch } from '../../lib/branch.ts';
import { dateSpan } from '../../lib/events/date-span.ts';
import { escapeMarkup } from '../../lib/escape-markup.ts';
import type { CompactEvent } from '../../lib/events/event-schema.ts';

const hour = (event: CompactEvent): string =>
  branch(event.h === undefined)(
    () => '',
    () => `<b>${escapeMarkup(event.h ?? '')}</b>`,
  );

const run = (event: CompactEvent): string =>
  branch(event.e === undefined)(
    () => '',
    () => `<span>${escapeMarkup(dateSpan(event))}</span>`,
  );

/** The hour, set large because under a day heading it is the one number a
 *  reader is looking for, and the run of dates when the event has one. */
export const feedCardWhen = (event: CompactEvent): string =>
  `<span class="photo-card-when">${hour(event)}${run(event)}</span>`;
