import type { TicketMessage } from './ticket-types.ts';

const SQL = `SELECT u.handle AS handle, m.staff AS staff, m.body AS body, m.attachment AS attachment,
                    m.created_at AS createdAt
               FROM ticket_messages m JOIN users u ON u.id = m.author_id
              WHERE m.ticket_id = ?
              ORDER BY m.created_at ASC`;

/** Every message of a thread, oldest first: a conversation is read downwards. */
export const ticketMessages = async (db: D1Database, ticketId: string): Promise<readonly TicketMessage[]> =>
  (await db.prepare(SQL).bind(ticketId).all<TicketMessage>()).results ?? [];
