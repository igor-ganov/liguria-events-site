import { branch } from '../branch.ts';
import { decodePlaces } from './decode-places.ts';
import type { Place } from './place-schema.ts';

/** Decode a place-shard response. A missing shard (a region not built yet) is
 *  empty rather than an error, and the body is only read when the response is
 *  one — a 404's HTML must never reach the decoder. */
export const decodedShard = (res: Response, region: string): Promise<readonly Place[]> =>
  branch(res.ok)<Promise<readonly Place[]>>(
    async () => decodePlaces(await res.json(), region),
    async () => [],
  );
