import type { Ticket } from './ticket-types.ts';

// Replaces whoever held it: a second approved claim is a decision that the
// first was wrong, and the ticket id on the row says which decision stands.
const SQL = `INSERT INTO event_owners (event_id, user_id, ticket_id, granted_by, created_at)
             VALUES (?, ?, ?, ?, ?)
             ON CONFLICT (event_id) DO UPDATE SET user_id = excluded.user_id, ticket_id = excluded.ticket_id,
               granted_by = excluded.granted_by, created_at = excluded.created_at`;

/** The statement that hands an event to the reader who claimed it. */
export const grantEventOwner = (db: D1Database, ticket: Ticket, adminId: string, now: string): D1PreparedStatement =>
  db.prepare(SQL).bind(ticket.eventId, ticket.userId, ticket.id, adminId, now);
