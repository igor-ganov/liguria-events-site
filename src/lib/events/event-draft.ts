import type { EventDraft } from './event-input-types.ts';
import { draftSpan } from './draft-span.ts';
import { jsonValue } from '../json-value.ts';
import { stringList } from '../string-list.ts';
import { trimmedString } from '../trimmed-string.ts';

// At most six categories are stored, so a padded payload cannot bloat a row.
const MAX_CATEGORIES = 6;

/** Read the event form payload into trimmed, length-bounded fields. Anything
 *  missing or of the wrong shape reads as empty rather than failing here — the
 *  rules in event-input-error decide what is actually required. */
export const eventDraft = (body: unknown): EventDraft => ({
  title: trimmedString(jsonValue(body, 'title'), 200),
  description: trimmedString(jsonValue(body, 'description'), 4000),
  ...draftSpan(body),
  venue: trimmedString(jsonValue(body, 'venue'), 200),
  address: trimmedString(jsonValue(body, 'address'), 300),
  phone: trimmedString(jsonValue(body, 'phone'), 40),
  website: trimmedString(jsonValue(body, 'website'), 300),
  cover: trimmedString(jsonValue(body, 'coverImage'), 500),
  lat: trimmedString(jsonValue(body, 'lat'), 32),
  lng: trimmedString(jsonValue(body, 'lng'), 32),
  categories: stringList(jsonValue(body, 'categories')).slice(0, MAX_CATEGORIES),
  free: jsonValue(body, 'free') === true,
});
