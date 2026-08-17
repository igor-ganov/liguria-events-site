import { emailShell } from './email-shell.ts';
import { escapeMarkup } from '../escape-markup.ts';

/** The subject + HTML of the outcome e-mail. */
export type ModerationMessage = Readonly<{ subject: string; html: string }>;

// Takes the ALREADY escaped title, so no builder can forget to escape it.
type Builder = (title: string, reason: string) => ModerationMessage;

// A reason is optional, so it contributes its own clause or nothing at all.
const because = (reason: string): string =>
  [reason]
    .filter((text) => text !== '')
    .map((text) => `: ${escapeMarkup(text)}`)
    .at(0) ?? '';

const published: Builder = (title) => ({
  subject: 'Your event is live on Dove Go',
  html: emailShell(
    `<p>Good news — your event <strong>“${title}”</strong> passed review and is now published on Dove Go.</p><p>Thanks for contributing!</p>`,
  ),
});

const rejected: Builder = (title, reason) => ({
  subject: 'Your Dove Go submission wasn’t published',
  html: emailShell(
    `<p>Your event <strong>“${title}”</strong> wasn’t published because it conflicts with our <a href="https://dovego.it/content-policy">Content Policy</a>${because(reason)}.</p><p>If you believe this was a mistake, reply to this email.</p>`,
  ),
});

const underReview: Builder = (title) => ({
  subject: 'Your Dove Go submission is under review',
  html: emailShell(
    `<p>Thanks — your event <strong>“${title}”</strong> was received and is being reviewed. We’ll email you once it’s decided.</p>`,
  ),
});

// Every status that is neither published nor rejected is still under review.
const BUILDERS = new Map<string, Builder>([
  ['published', published],
  ['rejected', rejected],
]);

/** The e-mail for one moderation outcome. */
export const moderationMessage = (title: string, status: string, reason: string): ModerationMessage =>
  (BUILDERS.get(status) ?? underReview)(escapeMarkup(title), reason);
