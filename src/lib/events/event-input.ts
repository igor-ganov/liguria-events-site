import type { EventInputResult } from './event-input-types.ts';
import { eventDraft } from './event-draft.ts';
import { eventInputError } from './event-input-error.ts';
import { eventInputValue } from './event-input-value.ts';
import { isDefined } from '../is-defined.ts';

export type { EventDraft, EventInput, EventInputResult } from './event-input-types.ts';

/** Validate + normalize the event form payload — shared by create (POST) and
 *  edit (PATCH) so both persist the same shape. */
export const parseEventInput = (body: unknown): EventInputResult => {
  const draft = eventDraft(body);
  return (
    [eventInputError(draft)]
      .filter(isDefined)
      .map((detail): EventInputResult => ({ ok: false, detail }))
      .at(0) ?? { ok: true, value: eventInputValue(draft) }
  );
};
