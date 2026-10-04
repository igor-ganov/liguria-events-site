import type { TicketStatus } from './ticket-types.ts';

const SQL = 'UPDATE tickets SET status = ?, updated_at = ? WHERE id = ?';

/** The statement that moves a thread to a state and stamps it as touched. */
export const setTicketStatus = (db: D1Database, id: string, status: TicketStatus, now: string): D1PreparedStatement =>
  db.prepare(SQL).bind(status, now, id);
