import { branch } from '../../lib/branch.ts';

const PREFIX = 'break:';

/** What a dragged block is: a manual break (its id is "break:<anchor stop>")
 *  or a real stop. `ref` is the anchor id / the stop id. */
export type CommitTarget = Readonly<{ kind: 'break' | 'stop'; ref: string }>;

export const commitTarget = (id: string): CommitTarget =>
  branch(id.startsWith(PREFIX))<CommitTarget>(
    () => ({ kind: 'break', ref: id.slice(PREFIX.length) }),
    () => ({ kind: 'stop', ref: id }),
  );
