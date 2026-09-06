import type { EditableRow, EventFormValues } from './detail-row-types.ts';
import { eventFormValues } from './event-form-values.ts';
import { isDefined } from '../is-defined.ts';

const SELECT =
  'SELECT title_en, desc_en, start_date, end_date, venue, categories, free, cover_image, ' +
  'address, phone, website, lat, lng, sessions, kind, submitter_id, updated_at FROM events WHERE id = ?';

/** The form's values and the version they were read at. */
export type EditableEvent = Readonly<{ values: EventFormValues; updatedAt: string }>;

/**
 * The author's own event as editable form values, or nothing if not theirs.
 *
 * `updatedAt` travels with them because an edit can now sit in a queue for
 * hours before it is sent: the form carries the version it was based on, and
 * the update refuses to overwrite a newer one.
 */
export const editableEventById = async (
  db: D1Database,
  id: string,
  userId: string,
): Promise<EditableEvent | undefined> => {
  const row = await db.prepare(SELECT).bind(id).first<EditableRow & { updated_at: string }>();
  return [row ?? undefined]
    .filter(isDefined)
    .filter((r) => r.submitter_id === userId)
    .map((r) => ({ values: eventFormValues(r), updatedAt: r.updated_at }))
    .at(0);
};
