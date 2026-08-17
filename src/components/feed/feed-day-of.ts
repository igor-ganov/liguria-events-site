import { branch } from '../../lib/branch.ts';

/** Which day group a late-published event joins. One that started before the
 *  feed's today lands under today — the feed never grows a past day. */
export const feedDayOf = (start: string, today: string): string =>
  branch(start < today)(
    () => today,
    () => start,
  );
