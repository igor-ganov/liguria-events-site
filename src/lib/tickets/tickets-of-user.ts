import { TICKET_COLUMNS } from './ticket-columns.ts';
import type { Ticket } from './ticket-types.ts';

const SQL = `SELECT ${TICKET_COLUMNS} WHERE t.user_id = ? ORDER BY t.updated_at DESC LIMIT 100`;

/** The threads one reader opened, the most recently touched first. */
export const ticketsOfUser = async (db: D1Database, userId: string): Promise<readonly Ticket[]> =>
  (await db.prepare(SQL).bind(userId).all<Ticket>()).results ?? [];
