import { branch } from '../../lib/branch.ts';

/** The badge next to the favourites link: the count, or nothing at all when
 *  there is nothing saved. */
export const favCountLabel = (count: number): string =>
  branch(count > 0)(() => String(count), () => '');
