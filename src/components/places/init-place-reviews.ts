// Client side of the place reviews section (server-rendered by PlaceDetail):
// a 1..5 star picker + comment, POSTed to /api/places/reviews. The wiring and
// the request shapes live one function per file next to this shell.
import { isDefined } from '../../lib/is-defined.ts';
import { wireReviewForm } from './wire-review-form.ts';

const wire = (root: HTMLElement): void => {
  root.dataset['ready'] = 'true';
  [root.querySelector<HTMLFormElement>('[data-rv-form]') ?? undefined]
    .filter(isDefined)
    .forEach((form) => wireReviewForm(root, form));
};

/** Shell: find the reviews section and wire it exactly once. */
export const initPlaceReviews = (): void => {
  [document.querySelector<HTMLElement>('[data-rv]') ?? undefined]
    .filter(isDefined)
    .filter((root) => root.dataset['ready'] !== 'true')
    .forEach(wire);
};
