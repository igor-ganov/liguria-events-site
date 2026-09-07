import { decodeLandmarks } from './decode-landmarks.ts';
import { refuseAway } from '../data/refuse-away.ts';
import type { Landmark } from './landmark-schema.ts';

/** A shard response as landmarks. A region not built yet answers 404 and reads
 *  as empty; a shard the site could not be asked for at all is refused, so the
 *  page can say which of the two it is. */
export const landmarksFromResponse = async (
  res: Response,
  region: string,
): Promise<readonly Landmark[]> => {
  refuseAway(res.status);
  return (
    await Promise.all(
      [res].filter((response) => response.ok).map(async (response) => decodeLandmarks(await response.json(), region)),
    )
  ).at(0) ?? [];
};
