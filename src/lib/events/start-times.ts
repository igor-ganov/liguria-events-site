import { isDefined } from '../is-defined.ts';
import type { CompactEvent } from './event-schema.ts';

/** Every hour an event starts at on its day: the whole list when a programme
 *  gave it several, its one hour otherwise, none when it has none. */
export const startTimes = (event: CompactEvent): readonly string[] => (event.hs ?? [event.h]).filter(isDefined);
