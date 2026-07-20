import type { APIRoute } from 'astro';
import {
  deletePlaceReview,
  myPlaceReview,
  placeReviewList,
  placeReviewSummary,
  upsertPlaceReview,
} from '../../../lib/places/reviews.ts';
import { REGION_GEO } from '../../../lib/region/region-bounds.ts';

export const prerender = false;

// A place id is an open-data id (osm:node/… | ovt:…); accept only that shape so
// the endpoint can't be used to write arbitrary keys.
const isPlaceId = (v: unknown): v is string => typeof v === 'string' && /^(osm:(node|way|relation)\/\d+|ovt:[a-z0-9]+)$/.test(v);
const str = (v: unknown, max: number): string => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/** Public: summary + recent reviews for a place, plus the caller's own review. */
export const GET: APIRoute = async ({ url, locals }) => {
  const placeId = url.searchParams.get('place') ?? '';
  if (!isPlaceId(placeId)) return Response.json({ error: 'invalid place' }, { status: 400 });
  const db = locals.runtime.env.DB;
  const [summary, reviews, mine] = await Promise.all([
    placeReviewSummary(db, placeId),
    placeReviewList(db, placeId),
    locals.user ? myPlaceReview(db, locals.user.id, placeId) : Promise.resolve(null),
  ]);
  return Response.json({ summary, reviews, mine });
};

/** Create or update the signed-in user's review (rating 1..5 + optional text). */
export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
  if (user.banned) return Response.json({ error: 'banned' }, { status: 403 });

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const placeId = body.place;
  const region = str(body.region, 40);
  const rating = Math.round(Number(body.rating));
  const comment = str(body.comment, 2000) || null;
  if (!isPlaceId(placeId)) return Response.json({ error: 'invalid place' }, { status: 400 });
  if (!(region in REGION_GEO)) return Response.json({ error: 'invalid region' }, { status: 400 });
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return Response.json({ error: 'invalid', detail: 'Rating must be 1–5.' }, { status: 400 });
  }

  await upsertPlaceReview(locals.runtime.env.DB, { placeId, region, userId: user.id, rating, comment });
  return Response.json({ ok: true });
};

/** Remove the caller's own review for a place. */
export const DELETE: APIRoute = async ({ url, locals }) => {
  const user = locals.user;
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const placeId = url.searchParams.get('place') ?? '';
  if (!isPlaceId(placeId)) return Response.json({ error: 'invalid place' }, { status: 400 });
  await deletePlaceReview(locals.runtime.env.DB, user.id, placeId);
  return Response.json({ ok: true });
};
