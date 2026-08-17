import { branch } from '../branch.ts';
import { uiIcon } from '../icons/ui-icon.ts';

/** A row of five star icons, the first `rating` (rounded) lit — rendered
 *  server-side, so a place's score needs no client JS. */
export const reviewStars = (rating: number): string =>
  Array.from(
    { length: 5 },
    (_, i) =>
      `<span class="rv-star${branch(i < Math.round(rating))(
        () => ' on',
        () => '',
      )}">${uiIcon('star', 15)}</span>`,
  ).join('');
