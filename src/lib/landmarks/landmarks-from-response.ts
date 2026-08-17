import { decodeLandmarks } from './decode-landmarks.ts';
import type { Landmark } from './landmark-schema.ts';

/** A shard response as landmarks. A failed response (region not built yet)
 *  resolves to empty and its body is never read. */
export const landmarksFromResponse = async (
  res: Response,
  region: string,
): Promise<readonly Landmark[]> =>
  (
    await Promise.all(
      [res].filter((response) => response.ok).map(async (response) => decodeLandmarks(await response.json(), region)),
    )
  ).at(0) ?? [];
