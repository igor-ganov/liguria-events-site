import { escapeMarkup } from '../escape-markup.ts';
import type { TicketMail } from './ticket-mail.ts';

type Input = Readonly<{ address: string; code: string; eventTitle: string; eventUrl: string }>;

const part = (lead: string, give: string, ignore: string, { code, eventTitle, eventUrl }: Input): string =>
  `<p>${lead} <a href="${eventUrl}">${escapeMarkup(eventTitle)}</a>.</p>` +
  `<p>${give} <strong style="font-size:1.4em;letter-spacing:0.15em">${code}</strong></p><p>${ignore}</p>`;

/**
 * The letter that carries a code to an organiser's own mailbox. Whoever reads
 * it did not ask for it, so it says who we are, which event it is about, what
 * the code is for and that doing nothing is a complete answer. In Italian
 * first, then in English: the mailboxes are Italian, their readers not always.
 */
export const claimCodeMail = (input: Input): TicketMail => ({
  to: [input.address],
  subject: `Dove Go: codice di verifica — ${input.eventTitle}`,
  html:
    part(
      'Qualcuno ha chiesto di gestire su dovego.it la pagina di',
      'Se siete voi, o una persona che lavora per voi, inserite questo codice nella conversazione su dovego.it:',
      'Se non ne sapete nulla, ignorate questa lettera: senza il codice la richiesta non va avanti.',
      input,
    ) +
    '<hr />' +
    part(
      'Somebody asked to manage, on dovego.it, the page of',
      'If that is you, or someone working for you, enter this code in the conversation on dovego.it:',
      'If you know nothing about it, ignore this letter: without the code the request goes nowhere.',
      input,
    ),
});
