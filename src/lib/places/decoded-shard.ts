import { branch } from '../branch.ts';
import { decodePlaces } from './decode-places.ts';
import { refuseAway } from '../data/refuse-away.ts';
import type { Place } from './place-schema.ts';

/** Decode a place-shard response. A region not built yet answers 404 and is
 *  empty rather than an error, and the body is only read when the response is
 *  one — a 404's HTML must never reach the decoder. A shard the site could not
 *  be asked for at all is refused, so the page can say which of the two it is. */
export const decodedShard = (res: Response, region: string): Promise<readonly Place[]> =>
  branch(refuseAway(res.status) === undefined && res.ok)<Promise<readonly Place[]>>(
    async () => decodePlaces(await res.json(), region),
    async () => [],
  );
