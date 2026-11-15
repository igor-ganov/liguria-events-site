import type { SuggestDoc, SuggestGroups } from '../../lib/suggest/suggest-doc.ts';

/** Both groups as the one list the arrow keys walk: events, then venues —
 *  the order they are shown in. */
export const flatOptions = (groups: SuggestGroups): readonly SuggestDoc[] => [...groups.events, ...groups.venues];
