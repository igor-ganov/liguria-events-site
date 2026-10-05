import { escapeMarkup } from '../escape-markup.ts';
import type { TicketKind } from './ticket-types.ts';

/** What happened to a thread, from the point of view of who must be told. */
export type TicketMove = 'opened' | 'reader-wrote' | 'staff-wrote' | 'decided';

type Input = Readonly<{
  ticket: Readonly<{ id: string; kind: TicketKind; eventTitle: string }>;
  moved: TicketMove;
  origin: string;
  admins: readonly string[];
  reader: string;
  words: string;
}>;

export type TicketMail = Readonly<{ to: readonly string[]; subject: string; html: string }>;

const KIND: Readonly<Record<TicketKind, string>> = { report: 'a problem', claim: 'ownership' };
const LEAD: Readonly<Record<TicketMove, string>> = {
  opened: 'A reader opened a request.',
  'reader-wrote': 'A reader added to a request.',
  'staff-wrote': 'We have answered your request.',
  decided: 'Your request has been decided.',
};
const TO_STAFF: readonly TicketMove[] = ['opened', 'reader-wrote'];
const QUOTE = 300;

/**
 * The letter that says a thread moved. The staff hear when a reader opens or
 * adds to one; the reader hears when the staff answer or decide. Only the
 * beginning of the message is quoted, and everything a person typed is escaped:
 * the letter is a pointer to the thread, not a second copy of it.
 */
export const ticketMail = ({ ticket, moved, origin, admins, reader, words }: Input): TicketMail => ({
  to: [admins].filter(() => TO_STAFF.includes(moved)).at(0) ?? [reader],
  subject: `Dove Go: ${KIND[ticket.kind]} — ${ticket.eventTitle}`,
  html:
    `<p>${LEAD[moved]}</p><p><strong>${escapeMarkup(ticket.eventTitle)}</strong></p>` +
    `<blockquote>${escapeMarkup(words.slice(0, QUOTE))}</blockquote>` +
    `<p><a href="${origin}/tickets/${ticket.id}/">Open the conversation</a></p>`,
});
