/** What to do with a queued submission once the queue has tried to send it. */
export type FlushVerdict = 'done' | 'keep' | 'conflict' | 'refused';

const FINAL = [400, 403, 404, 410, 422];

/**
 * Whether a queued item leaves the queue, stays, or needs its author.
 *
 * Three of the four are ordinary. The fourth is the interesting one: a 409
 * means the event changed while this edit was waiting, and sending it anyway
 * would quietly overwrite whatever that change was. It leaves the queue only
 * when a person has decided which version wins.
 *
 * A 401 is deliberately `keep`. Being signed out does not make the work wrong,
 * and throwing it away because a session expired overnight is the exact
 * failure this mechanism was built to prevent.
 */
export const flushVerdict = (status: number | undefined): FlushVerdict =>
  [status]
    .filter((code) => code !== undefined)
    .map((code): FlushVerdict => {
      const ok = code >= 200 && code < 300;
      return [
        ...[ok].filter(Boolean).map((): FlushVerdict => 'done'),
        ...[code === 409].filter(Boolean).map((): FlushVerdict => 'conflict'),
        ...[FINAL.includes(code)].filter(Boolean).map((): FlushVerdict => 'refused'),
      ].at(0) ?? 'keep';
    })
    .at(0) ?? 'keep';
