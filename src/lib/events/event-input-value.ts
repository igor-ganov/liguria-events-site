import type { EventDraft, EventInput } from './event-input-types.ts';
import { coordinatesOf } from './coordinates-of.ts';
import { sqlFlag } from '../sql-flag.ts';
import { sqlText } from '../sql-text.ts';

// Cover images are restricted to our own /uploads/ path (no arbitrary remote
// URLs), websites to http(s) — anything else is stored as no value at all.
const isHttpUrl = (value: string): boolean => /^https?:\/\//.test(value);
const isUploadPath = (value: string): boolean => value.startsWith('/uploads/');

// The programme as stored JSON, empty unless this is a container with dates.
const programmeJson = (draft: EventDraft): string =>
  [draft.sessions].filter(() => draft.container).filter((s) => s.length > 0).map((s) => JSON.stringify(s)).at(0) ?? '';

/** A validated draft as the row the endpoints bind to SQL. */
export const eventInputValue = (draft: EventDraft): EventInput => ({
  title: draft.title,
  description: draft.description,
  startDate: draft.startDate,
  endDate: sqlText(draft.endDate),
  venue: sqlText(draft.venue),
  address: sqlText(draft.address),
  phone: sqlText(draft.phone),
  website: sqlText(draft.website, isHttpUrl),
  cover: sqlText(draft.cover, isUploadPath),
  ...coordinatesOf(draft.lat, draft.lng),
  categoriesJson: JSON.stringify(draft.categories),
  free: sqlFlag(draft.free),
  // Only a container stores a programme and a kind: a standalone event that
  // happened to carry rows in the form keeps its plain run.
  sessionsJson: sqlText(programmeJson(draft)),
  kind: sqlText([draft.container].filter(Boolean).map(() => 'container').at(0) ?? ''),
});
