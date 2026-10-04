import { newId } from './new-id.ts';

const SQL = `INSERT INTO ticket_messages (id, ticket_id, author_id, staff, body, attachment, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)`;

type Message = Readonly<{ ticketId: string; authorId: string; staff: boolean; body: string; attachment: string | undefined }>;

/** The statement that adds one message to a thread, for a caller to run alone
 *  or in a batch with whatever else has to happen in the same breath. */
export const addTicketMessage = (db: D1Database, message: Message, now: string): D1PreparedStatement =>
  db
    .prepare(SQL)
    .bind(newId(), message.ticketId, message.authorId, Number(message.staff), message.body, message.attachment ?? null, now);
