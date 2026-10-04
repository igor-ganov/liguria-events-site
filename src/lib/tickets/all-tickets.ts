import { TICKET_COLUMNS } from './ticket-columns.ts';
import type { Ticket } from './ticket-types.ts';

// Waiting-for-us first, then by how long ago anything happened: the desk reads
// from the top, and the top should be what somebody is waiting on.
const ORDER = "CASE t.status WHEN 'open' THEN 0 WHEN 'answered' THEN 1 ELSE 2 END, t.updated_at DESC";
const SQL = `SELECT ${TICKET_COLUMNS} ORDER BY ${ORDER} LIMIT 200`;

/** Every thread, for the staff desk. */
export const allTickets = async (db: D1Database): Promise<readonly Ticket[]> =>
  (await db.prepare(SQL).all<Ticket>()).results ?? [];
