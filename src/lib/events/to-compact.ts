import type { EventRow } from './event-row-types.ts';
import { coordsOf } from './coords-of.ts';
import { eventCategories } from './event-categories.ts';
import { localizedText } from './localized-text.ts';
import { storedSessions } from './stored-sessions.ts';
import { truthy } from '../truthy.ts';

/** One D1 row → a CompactEvent-shaped object (decode-event-list validates it).
 *  Each optional key is spread from a 0-or-1 list, so an empty column leaves the
 *  key out entirely rather than writing an empty value. */
export const toCompact = (r: EventRow): Record<string, unknown> => ({
  id: r.id,
  t: r.title_en ?? '',
  tl: localizedText(r.title_en, r.title_it, r.title_ru),
  s: r.start_date,
  c: eventCategories(r.categories),
  u: '',
  ...truthy(r.end_date).map((e) => ({ e })).at(0),
  ...truthy(r.venue).map((v) => ({ v })).at(0),
  ...truthy(r.free).map(() => ({ f: true })).at(0),
  ...truthy(r.gem).map(() => ({ x: true })).at(0),
  ...truthy(r.cover_image).map((img) => ({ img })).at(0),
  ...coordsOf(r.lat, r.lng),
  ...truthy(r.desc_en).map(() => ({ d: localizedText(r.desc_en, r.desc_it, r.desc_ru) })).at(0),
  // The programme, and the container flag that tells the feed and the map to
  // honour it instead of the run.
  ...[storedSessions(r.sessions)].filter((p) => p.length > 0).map((p) => ({ p })).at(0),
  ...truthy(r.kind === 'container').map(() => ({ k: true })).at(0),
  // Made here, not found: the feed badges it, the filter offers it, and the
  // within-day sort puts it first.
  ...truthy(r.origin === 'user').map(() => ({ pl: true })).at(0),
});
