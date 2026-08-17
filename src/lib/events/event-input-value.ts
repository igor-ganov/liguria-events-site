import type { EventDraft, EventInput } from './event-input-types.ts';
import { coordinatesOf } from './coordinates-of.ts';
import { sqlFlag } from '../sql-flag.ts';
import { sqlText } from '../sql-text.ts';

// Cover images are restricted to our own /uploads/ path (no arbitrary remote
// URLs), websites to http(s) — anything else is stored as no value at all.
const isHttpUrl = (value: string): boolean => /^https?:\/\//.test(value);
const isUploadPath = (value: string): boolean => value.startsWith('/uploads/');

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
});
