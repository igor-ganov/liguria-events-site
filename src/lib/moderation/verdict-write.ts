import { statusFor } from './status-for.ts';
import type { Verdict } from './verdict-types.ts';

// Only an event still waiting: by the time a slow verdict lands, a member of
// staff may have published or rejected it, and a person's decision stands.
const SQL = `UPDATE events SET status = ?, gem = ?, updated_at = ? WHERE id = ? AND status = 'pending'`;

/** The statement that records the model's verdict on an event, and its values. */
export const verdictWrite = (id: string, verdict: Verdict, now: string): Readonly<{ sql: string; values: readonly unknown[] }> => ({
  sql: SQL,
  values: [statusFor(verdict.verdict), Number(verdict.gem), now, id],
});
