import { editOutcome } from './edit-outcome.ts';
import { isDefined } from '../is-defined.ts';
import type { EditOutcome } from './edit-outcome.ts';
import type { EventEnv } from './event-env.ts';
import type { EventInput } from './event-input.ts';

const UPDATE = `UPDATE events SET title_en = ?, desc_en = ?, start_date = ?, end_date = ?, categories = ?,
       venue = ?, address = ?, phone = ?, website = ?, cover_image = ?, lat = ?, lng = ?, free = ?,
       sessions = ?, kind = ?, status = 'pending', updated_at = ? WHERE id = ? AND submitter_id = ?`;

// The same update, refusing to write over a version the author has not seen.
// An edit made with no signal can sit in the outbox for hours; without the
// guard it lands silently on top of whatever changed in the meantime.
const GUARDED = `${UPDATE} AND updated_at = ?`;

/** Write the edit, and say whether it landed or was overtaken. */
export const writeEventEdit = async (
  env: EventEnv,
  input: EventInput,
  base: string | undefined,
  at: string,
  id: string,
  userId: string,
): Promise<EditOutcome> => {
  const values = [
    input.title, input.description, input.startDate, input.endDate, input.categoriesJson,
    input.venue, input.address, input.phone, input.website, input.cover, input.lat, input.lng,
    input.free, input.sessionsJson, input.kind, at, id, userId,
  ];
  const guard = [base].filter(isDefined);
  const result = await env.DB.prepare([UPDATE, GUARDED][guard.length] ?? UPDATE)
    .bind(...values, ...guard)
    .run();
  return editOutcome(base, Number(result.meta?.changes ?? 0));
};
