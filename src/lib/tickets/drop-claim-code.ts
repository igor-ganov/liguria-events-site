/** The statement that forgets the code sent for a thread: it has been used, or
 *  the thread was decided without it. */
export const dropClaimCode = (db: D1Database, ticketId: string): D1PreparedStatement =>
  db.prepare('DELETE FROM claim_codes WHERE ticket_id = ?').bind(ticketId);
