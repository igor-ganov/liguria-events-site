import type { APIRoute } from 'astro';
import { isActiveMember } from '../../../lib/auth/is-active-member.ts';
import { isDefined } from '../../../lib/is-defined.ts';
import { isPlaceId } from '../../../lib/places/is-place-id.ts';
import { memberDenial } from '../../../lib/auth/member-denial.ts';
import { placeReviewsView } from '../../../lib/places/place-reviews-view.ts';
import { removePlaceReview } from '../../../lib/places/remove-place-review.ts';
import { savePlaceReview } from '../../../lib/places/save-place-review.ts';

export const prerender = false;

/** Public: summary + recent reviews for a place, plus the caller's own review. */
export const GET: APIRoute = async ({ url, locals }) => {
  const place = url.searchParams.get('place') ?? '';
  const views = await Promise.all(
    [place].filter(isPlaceId).map((placeId) => placeReviewsView(locals.runtime.env.DB, placeId, locals.user)),
  );
  return views.at(0) ?? Response.json({ error: 'invalid place' }, { status: 400 });
};

/** Create or update the signed-in user's review (rating 1..5 + optional text).
 *  A signed-out caller is a 401 and a banned one a 403, before the body is read. */
export const POST: APIRoute = async ({ request, locals }) => {
  const written = await Promise.all(
    [locals.user].filter(isActiveMember).map(async (user) =>
      savePlaceReview(locals.runtime.env.DB, user, await request.json().catch(() => ({}))),
    ),
  );
  return written.at(0) ?? memberDenial(locals.user);
};

/** Remove the caller's own review for a place. A banned account may still do
 *  this — only the missing session is refused, exactly as before. */
export const DELETE: APIRoute = async ({ url, locals }) => {
  const place = url.searchParams.get('place') ?? '';
  const removed = await Promise.all(
    [locals.user].filter(isDefined).map((user) => removePlaceReview(locals.runtime.env.DB, user.id, place)),
  );
  return removed.at(0) ?? Response.json({ error: 'unauthorized' }, { status: 401 });
};
