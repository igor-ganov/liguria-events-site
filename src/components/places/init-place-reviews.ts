// Client side of the place reviews section (server-rendered by PlaceDetail):
// a 1..5 star picker + comment, POSTed to /api/places/reviews. On success we
// reload so the freshly-written review re-renders server-side (single source of
// truth), keeping this script tiny and stateless.

const paint = (stars: readonly HTMLElement[], rating: number): void =>
  stars.forEach((s, i) => s.classList.toggle('sel', i < rating));

/** Wire the reviews form: star picker, submit (upsert) and remove. */
export const initPlaceReviews = (): void => {
  const root = document.querySelector<HTMLElement>('[data-rv]');
  if (!root || root.dataset['ready'] === 'true') return;
  root.dataset['ready'] = 'true';

  const place = root.dataset['place'] ?? '';
  const region = root.dataset['region'] ?? '';
  const form = root.querySelector<HTMLFormElement>('[data-rv-form]');
  if (!form) return;

  const starWrap = form.querySelector<HTMLElement>('[data-rv-stars]');
  const stars = [...form.querySelectorAll<HTMLElement>('[data-rv-star]')];
  let rating = Number(starWrap?.dataset['current'] ?? 0);
  paint(stars, rating);
  stars.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      rating = i + 1;
      paint(stars, rating);
    });
  });

  const comment = form.querySelector<HTMLTextAreaElement>('[data-rv-comment]');
  const submit = form.querySelector<HTMLButtonElement>('[data-rv-submit]');

  const send = async (method: 'POST' | 'DELETE'): Promise<void> => {
    if (submit) submit.disabled = true;
    const res =
      method === 'POST'
        ? await fetch('/api/places/reviews', {
            method,
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ place, region, rating, comment: comment?.value ?? '' }),
          })
        : await fetch(`/api/places/reviews?place=${encodeURIComponent(place)}`, { method });
    if (res.ok) {
      location.reload();
    } else if (submit) {
      submit.disabled = false;
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (rating >= 1 && rating <= 5) void send('POST');
  });
  form.querySelector('[data-rv-delete]')?.addEventListener('click', () => void send('DELETE'));
};
