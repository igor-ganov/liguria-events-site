/** What a moderation action does to the event row, and how it is audited. */
export type EventAction = Readonly<{
  sql: string;
  bindings: (id: string, now: string) => readonly unknown[];
  log: string;
}>;

const SET_STATUS = 'UPDATE events SET status = ?, updated_at = ? WHERE id = ?';
const DROP_EVENT = 'DELETE FROM events WHERE id = ?';

// A Map, not an object literal: the key arrives in a request body, so a plain
// object would answer for 'constructor' and friends too.
const ACTIONS = new Map<string, EventAction>([
  ['publish', { sql: SET_STATUS, bindings: (id, now) => ['published', now, id], log: 'admin_publish' }],
  ['reject', { sql: SET_STATUS, bindings: (id, now) => ['rejected', now, id], log: 'admin_reject' }],
  ['delete', { sql: DROP_EVENT, bindings: (id) => [id], log: 'admin_delete' }],
]);

/** The action a request names, or nothing at all for an unknown one. */
export const eventAction = (action: string): EventAction | undefined => ACTIONS.get(action);
