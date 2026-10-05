// A new sending replaces the old one: the count of sendings goes up, which
// changes the code, and the guesses start again from none.
const SQL = `INSERT INTO claim_codes (ticket_id, address, sends, tries, sent_by, expires_at, created_at)
             VALUES (?, ?, 1, 0, ?, ?, ?)
             ON CONFLICT (ticket_id) DO UPDATE SET address = excluded.address, sends = claim_codes.sends + 1, tries = 0,
               sent_by = excluded.sent_by, expires_at = excluded.expires_at, created_at = excluded.created_at`;

type Sending = Readonly<{ ticketId: string; address: string; sentBy: string; expiresAt: string }>;

/** The statement that records a code as sent for a thread. */
export const saveClaimCode = (db: D1Database, sending: Sending, now: string): D1PreparedStatement =>
  db.prepare(SQL).bind(sending.ticketId, sending.address, sending.sentBy, sending.expiresAt, now);
