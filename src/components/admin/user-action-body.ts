import { isDefined } from '../../lib/is-defined.ts';

/** The questions a destructive action must clear before it is sent. */
export type AdminPrompts = Readonly<{
  prompt: (message: string) => string | undefined;
  confirm: (message: string) => boolean;
}>;

/** The body POSTed to /api/admin/user. */
export type UserActionBody = Readonly<{ id: string; action: string; reason: string }>;

const BAN_PROMPT = 'Reason for the ban (shown in the audit log):';
const PURGE_PROMPT = 'Delete every event this person submitted?';

// Each guard yields the 0-or-1 reasons its action may proceed with: a ban needs
// a typed reason, a purge needs a confirmation, anything else just goes.
const GUARDS: Readonly<Record<string, (prompts: AdminPrompts) => readonly string[]>> = {
  ban: (prompts) => [prompts.prompt(BAN_PROMPT) ?? ''].filter((reason) => reason !== ''),
  delete_events: (prompts) => [''].filter(() => prompts.confirm(PURGE_PROMPT)),
};

const reasonsFor = (action: string, prompts: AdminPrompts): readonly string[] =>
  (GUARDS[action] ?? (() => ['']))(prompts);

/** The 0-or-1 request a clicked row + button asks for: a missing id or action,
 *  a cancelled prompt and a refused confirmation all yield none. */
export const userActionBody = (
  id: string | undefined,
  action: string | undefined,
  prompts: AdminPrompts,
): readonly UserActionBody[] =>
  [id]
    .filter(isDefined)
    .filter((value) => value !== '')
    .flatMap((user) =>
      [action]
        .filter(isDefined)
        .filter((value) => value !== '')
        .flatMap((act) => reasonsFor(act, prompts).map((reason) => ({ id: user, action: act, reason }))),
    );
