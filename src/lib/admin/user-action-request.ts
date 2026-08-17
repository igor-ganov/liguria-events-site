import { jsonField } from '../json-field.ts';

/** The three fields an admin action carries. */
export type UserActionRequest = Readonly<{ id: string; action: string; reason: string }>;

/** Read the request body: a field of any other shape (or no object at all)
 *  reads as '', and the reason is capped at 300 characters. */
export const userActionRequest = (body: unknown): UserActionRequest => ({
  id: jsonField(body, 'id') ?? '',
  action: jsonField(body, 'action') ?? '',
  reason: (jsonField(body, 'reason') ?? '').slice(0, 300),
});
