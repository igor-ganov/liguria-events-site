import { isDefined } from '../../lib/is-defined.ts';

/** The uploaded image's URL, or nothing when the upload did not produce one —
 *  a rejected response and an accepted-but-empty one fail the same way. */
export const uploadedImageUrl = (ok: boolean, url: string | undefined): string | undefined =>
  [url]
    .filter(isDefined)
    .filter((value) => value !== '')
    .filter(() => ok)[0];
