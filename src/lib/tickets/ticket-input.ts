import { trimmedString } from '../trimmed-string.ts';

/** A request as it arrives from the form, before it is judged. */
export type TicketInput = Readonly<{ kind: string; event: string; title: string; body: string }>;

const field = (form: FormData, name: string, max: number): string => trimmedString(form.get(name), max);

/** Read the form. Every field is trimmed and capped here, once, so nothing
 *  further down has to wonder how long a title can be. */
export const ticketInput = (form: FormData): TicketInput => ({
  kind: field(form, 'kind', 20),
  event: field(form, 'event', 40),
  title: field(form, 'title', 200),
  body: field(form, 'body', 4000),
});
