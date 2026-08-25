import type { EditableRow, EventFormValues } from './detail-row-types.ts';
import { eventFormValues } from './event-form-values.ts';
import { isDefined } from '../is-defined.ts';

const SELECT =
  'SELECT title_en, desc_en, start_date, end_date, venue, categories, free, cover_image, ' +
  'address, phone, website, lat, lng, sessions, kind, submitter_id FROM events WHERE id = ?';

/** The author's own event as editable form values, or nothing if not theirs. */
export const editableEventById = async (
  db: D1Database,
  id: string,
  userId: string,
): Promise<EventFormValues | undefined> => {
  const row = await db.prepare(SELECT).bind(id).first<EditableRow>();
  return [row ?? undefined]
    .filter(isDefined)
    .filter((r) => r.submitter_id === userId)
    .map(eventFormValues)
    .at(0);
};
