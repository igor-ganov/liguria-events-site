import { approvalStatements } from './approval-statements.ts';
import { claimCode } from './claim-code.ts';
import { codeVerdict } from './code-verdict.ts';
import { isDefined } from '../is-defined.ts';
import { notifyTicket } from './notify-ticket.ts';
import { seeOther } from './see-other.ts';
import { takeCodeTry } from './take-code-try.ts';
import type { CodeEnv } from './send-claim-code.ts';
import type { CodeVerdict } from './code-verdict.ts';
import type { CompactEvent } from '../events/event-schema.ts';
import type { DeferredWork } from '../deferred-work.ts';
import type { Ticket } from './ticket-types.ts';

// Where each verdict sends the claimant: back to the thread, which says what
// happened — by its new state when the code was right, by a note otherwise.
const AFTER: Readonly<Record<CodeVerdict, string>> = { right: '', wrong: '?code=wrong', spent: '?code=spent', none: '?code=none' };

/**
 * Take the code a claimant typed. The guess is counted first and compared
 * second (see takeCodeTry); the right code approves the claim exactly as a
 * member of staff would have, in the name of the one who sent it, and is then
 * forgotten. Anything else changes nothing but the count.
 */
export const enterClaimCode = async (env: CodeEnv, ctx: DeferredWork, ticket: Ticket, typed: string, crawled: CompactEvent | undefined): Promise<Response> => {
  const before = await takeCodeTry(env.DB, ticket.id);
  const expected = await claimCode(env.SESSION_SECRET, ticket.id, before?.address ?? '', before?.sends ?? 0);
  const now = new Date().toISOString();
  const verdict = codeVerdict(before, typed, expected, now);
  await Promise.all(
    [before]
      .filter(isDefined)
      .filter(() => verdict === 'right')
      .map(async (row) => {
        await env.DB.batch([...approvalStatements(env.DB, row.sentBy, ticket, now, crawled)]);
        notifyTicket(env, ctx, ticket, 'decided', 'Decision: approve.');
      }),
  );
  return seeOther(`/tickets/${ticket.id}/${AFTER[verdict]}`);
};
