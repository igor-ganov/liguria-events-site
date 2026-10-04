import { TICKET_COLUMNS } from './ticket-columns.ts';
import type { Ticket } from './ticket-types.ts';

const SQL = `SELECT ${TICKET_COLUMNS} WHERE t.id = ?`;

/** One thread by its id. */
export const ticketOf = async (db: D1Database, id: string): Promise<Ticket | undefined> =>
  (await db.prepare(SQL).bind(id).first<Ticket>()) ?? undefined;
