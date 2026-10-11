import { largeCover } from './large-cover.ts';
import { thumbKey } from './thumb-key.ts';

/**
 * Where our own copy of a photograph is, when one has been made: the size an
 * event page shows at its top, kept on the storage this origin serves. Named
 * after the address of the file the page would otherwise have fetched from the
 * source, exactly as the small copies of the feed are. A picture that is
 * already ours, or has no copy yet, has no answer here and is shown as before.
 */
export const ownCover =
  (made: ReadonlySet<string>) =>
  (image: string): string | undefined =>
    [image]
      .filter((url) => url.startsWith('https://'))
      .map((url) => thumbKey(largeCover(url)))
      .filter((key) => made.has(key))
      .map((key) => `/uploads/covers/${key}.webp`)
      .at(0);
