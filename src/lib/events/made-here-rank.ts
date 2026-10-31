import { branch } from '../branch.ts';
import type { CompactEvent } from './event-schema.ts';

/**
 * Made here leads its day: 0 for an event made on the platform, 1 for one found
 * elsewhere. Deliberately a tie-break inside a day and never a boost across
 * days: the feed answers "what is on", and lifting a platform event above a
 * concert happening sooner would answer a different question.
 */
export const madeHereRank = (event: CompactEvent): number =>
  branch(event.pl === true)(
    () => 0,
    () => 1,
  );
