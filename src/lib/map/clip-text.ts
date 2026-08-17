import { branch } from '../branch.ts';

/**
 * Trim a blurb to a whole-word boundary for the compact popup card: cut at the
 * limit, drop the partial trailing word, and mark the cut with an ellipsis.
 * A string already within the limit is returned untouched.
 */
export const clipText =
  (limit: number) =>
  (text: string): string =>
    branch(text.length > limit)(
      () => `${text.slice(0, limit - 1).replace(/\s+\S*$/, '')}…`,
      () => text,
    );
