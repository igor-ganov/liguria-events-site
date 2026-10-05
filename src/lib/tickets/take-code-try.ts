import type { ClaimCodeRow } from './claim-code-row.ts';

// Counted before the guess is looked at, in the one statement that also reads
// the row: a hundred guesses sent at once each get a different count, so no
// more than five of them can ever be compared with the code.
const SQL = `UPDATE claim_codes SET tries = tries + 1 WHERE ticket_id = ?
             RETURNING address, sends, tries - 1 AS tries, sent_by AS sentBy, expires_at AS expiresAt`;

/** Spend one guess at a thread's code, and say how things stood before it. */
export const takeCodeTry = async (db: D1Database, ticketId: string): Promise<ClaimCodeRow | undefined> =>
  (await db.prepare(SQL).bind(ticketId).first<ClaimCodeRow>()) ?? undefined;
