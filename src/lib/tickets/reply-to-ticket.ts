import { acceptedUpload } from '../img/accepted-upload.ts';
import { addTicketMessage } from './add-ticket-message.ts';
import { seeOther } from './see-other.ts';
import { setTicketStatus } from './set-ticket-status.ts';
import { statusAfter } from './status-after.ts';
import { storeTicketFile } from './store-ticket-file.ts';
import { trimmedString } from '../trimmed-string.ts';
import type { AppUser } from '../auth/types.ts';
import type { Ticket } from './ticket-types.ts';

type Env = Readonly<{ DB: D1Database; UPLOADS: R2Bucket }>;

const nothingSaid = (): Response => Response.json({ error: 'invalid body' }, { status: 400 });

/**
 * Add a message to a thread the caller may read, with one screenshot when the
 * form carried one, and move the thread to the state the message leaves it in.
 * A message with neither words nor a picture is refused: it would be an empty
 * line in a conversation. The message and the new state are written together.
 */
export const replyToTicket = async (env: Env, user: AppUser, ticket: Ticket, request: Request): Promise<Response> => {
  const form = await request.formData().catch(() => new FormData());
  const body = trimmedString(form.get('body'), 4000);
  const files = await Promise.all(acceptedUpload(form.get('file')).map((upload) => storeTicketFile(env.UPLOADS, upload)));
  const attachment = files.at(0);
  const said = [body, attachment ?? ''].some((part) => part !== '');
  const staff = user.role === 'admin';
  const now = new Date().toISOString();
  const written = await Promise.all(
    [ticket].filter(() => said).map(async () => {
      await env.DB.batch([
        addTicketMessage(env.DB, { ticketId: ticket.id, authorId: user.id, staff, body, attachment }, now),
        setTicketStatus(env.DB, ticket.id, statusAfter(ticket.status, staff), now),
      ]);
      return seeOther(`/tickets/${ticket.id}/`);
    }),
  );
  return written.at(0) ?? nothingSaid();
};
