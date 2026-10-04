// A request from a reader about one event: either something is wrong with it
// (report) or it is theirs (claim). Each is a thread of messages between that
// reader and the staff. See the 0012_tickets migration.

export const TICKET_KINDS = ['report', 'claim'] as const;
export type TicketKind = (typeof TICKET_KINDS)[number];

/** open = waiting for us; answered = waiting for the reader; the other two are
 *  closed, and the reader writing again opens the thread once more. */
export type TicketStatus = 'open' | 'answered' | 'resolved' | 'rejected';

export type Ticket = Readonly<{
  id: string;
  kind: TicketKind;
  status: TicketStatus;
  eventId: string;
  eventTitle: string;
  userId: string;
  handle: string;
  createdAt: string;
  updatedAt: string;
}>;

/** `attachment` keeps the empty marker of the database: the column is nullable
 *  and the D1 driver returns it verbatim. */
export type TicketMessage = Readonly<{
  handle: string;
  staff: number;
  body: string;
  attachment: string | null;
  createdAt: string;
}>;
