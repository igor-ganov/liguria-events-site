import { addTicketMessage } from './add-ticket-message.ts';
import { newId } from './new-id.ts';
import type { TicketInput } from './ticket-input.ts';

const SQL = `INSERT INTO tickets (id, kind, status, event_id, event_title, user_id, created_at, updated_at)
             VALUES (?, ?, 'open', ?, ?, ?, ?, ?)`;

/** Open a thread with its first message, both or neither: a request with no
 *  words in it would be a row nobody can answer. Answers with the new id. */
export const createTicket = async (db: D1Database, userId: string, input: TicketInput): Promise<string> => {
  const id = newId();
  const now = new Date().toISOString();
  await db.batch([
    db.prepare(SQL).bind(id, input.kind, input.event, input.title, userId, now, now),
    addTicketMessage(db, { ticketId: id, authorId: userId, staff: false, body: input.body, attachment: undefined }, now),
  ]);
  return id;
};
