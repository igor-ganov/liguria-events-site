/** The columns every listing of threads reads, with the handle of the reader
 *  who opened each. One place, so three queries cannot drift apart. */
export const TICKET_COLUMNS = `t.id AS id, t.kind AS kind, t.status AS status, t.event_id AS eventId,
  t.event_title AS eventTitle, t.user_id AS userId, u.handle AS handle,
  t.created_at AS createdAt, t.updated_at AS updatedAt
  FROM tickets t JOIN users u ON u.id = t.user_id`;
