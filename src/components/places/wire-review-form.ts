import { branch } from '../../lib/branch.ts';
import { isRating } from '../../lib/places/is-rating.ts';
import { paintStars } from './paint-stars.ts';
import { reviewRequest } from './review-request.ts';
import { setDisabled } from '../../lib/dom/set-disabled.ts';
import type { ReviewMethod } from './review-request.ts';

/** Wire one reviews form: the star picker, the upsert submit and the remove
 *  button. On success we reload, so the freshly-written review re-renders
 *  server-side (single source of truth) and this stays stateless. */
export const wireReviewForm = (root: HTMLElement, form: HTMLFormElement): void => {
  const place = root.dataset['place'] ?? '';
  const region = root.dataset['region'] ?? '';
  const starWrap = form.querySelector<HTMLElement>('[data-rv-stars]');
  const stars = [...form.querySelectorAll<HTMLElement>('[data-rv-star]')];
  const picked = { rating: Number(starWrap?.dataset['current'] ?? 0) };
  paintStars(stars, picked.rating);
  stars.forEach((button, index) => {
    button.addEventListener('click', () => {
      picked.rating = index + 1;
      paintStars(stars, picked.rating);
    });
  });

  const comment = form.querySelector<HTMLTextAreaElement>('[data-rv-comment]');
  const submit = form.querySelector<HTMLButtonElement>('[data-rv-submit]') ?? undefined;

  const send = async (method: ReviewMethod): Promise<void> => {
    setDisabled(submit, true);
    const { url, init } = reviewRequest(method, {
      place,
      region,
      rating: picked.rating,
      comment: comment?.value ?? '',
    });
    const res = await fetch(url, init);
    branch(res.ok)<void>(
      () => location.reload(),
      () => setDisabled(submit, false),
    );
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    [picked.rating].filter(isRating).forEach(() => void send('POST'));
  });
  form.querySelector('[data-rv-delete]')?.addEventListener('click', () => void send('DELETE'));
};
