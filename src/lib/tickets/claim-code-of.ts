import type { ClaimCodeRow } from './claim-code-row.ts';

const SQL = `SELECT address, sends, tries, sent_by AS sentBy, expires_at AS expiresAt FROM claim_codes WHERE ticket_id = ?`;

/** What is kept about the code sent for a thread, when one was. */
export const claimCodeOf = async (db: D1Database, ticketId: string): Promise<ClaimCodeRow | undefined> =>
  (await db.prepare(SQL).bind(ticketId).first<ClaimCodeRow>()) ?? undefined;
