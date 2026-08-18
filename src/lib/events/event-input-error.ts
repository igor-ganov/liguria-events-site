import type { EventDraft } from './event-input-types.ts';
import { isIsoDate } from '../is-iso-date.ts';

// The rules in the order they are reported, so the first failure wins exactly as
// the sequence of guard clauses did.
const RULES: readonly Readonly<{ broken: (draft: EventDraft) => boolean; detail: string }>[] = [
  {
    // A container has no run of its own — its dates ARE its programme, so an
    // empty one would leave an event that happens on no day at all.
    broken: (draft) => draft.container && draft.sessions.length === 0,
    detail: 'A multi-date event needs at least one date in its programme.',
  },
  {
    broken: (draft) => draft.title.length < 3 || !isIsoDate(draft.startDate),
    detail: 'Title and a valid start date are required.',
  },
  {
    broken: (draft) => draft.endDate !== '' && !isIsoDate(draft.endDate),
    detail: 'End date is malformed.',
  },
];

/** Why the draft cannot be accepted, or nothing when it can. */
export const eventInputError = (draft: EventDraft): string | undefined =>
  RULES.find((rule) => rule.broken(draft))?.detail;
