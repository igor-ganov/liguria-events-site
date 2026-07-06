import type { APIRoute } from 'astro';

export const prerender = false;

type Row = {
  id: string;
  title_en: string | null;
  title_it: string | null;
  title_ru: string | null;
  desc_en: string | null;
  desc_it: string | null;
  desc_ru: string | null;
  start_date: string;
  end_date: string | null;
  categories: string | null;
  venue: string | null;
  lat: number | null;
  lng: number | null;
  cover_image: string | null;
  free: number;
  gem: number;
};

const loc = (en: string | null, it: string | null, ru: string | null) => {
  const base = en ?? '';
  return { en: base, it: it ?? base, ru: ru ?? base };
};

const toCompact = (r: Row): Record<string, unknown> => {
  const title = r.title_en ?? '';
  const cats = ((): string[] => {
    try {
      const parsed = JSON.parse(r.categories ?? '[]') as unknown;
      return Array.isArray(parsed) ? parsed.filter((c): c is string => typeof c === 'string') : [];
    } catch {
      return [];
    }
  })();
  const event: Record<string, unknown> = {
    id: r.id,
    t: title,
    tl: loc(r.title_en, r.title_it, r.title_ru),
    s: r.start_date,
    c: cats.length > 0 ? cats : ['other'],
    u: '',
  };
  if (r.end_date) event.e = r.end_date;
  if (r.venue) event.v = r.venue;
  if (r.free) event.f = true;
  if (r.gem) event.x = true;
  if (r.cover_image) event.img = r.cover_image;
  if (r.lat !== null && r.lng !== null) event.g = [r.lng, r.lat];
  if (r.desc_en) event.d = loc(r.desc_en, r.desc_it, r.desc_ru);
  return event;
};

/** Published, user/crawler events from D1 in the feed's CompactEvent shape. */
export const GET: APIRoute = async ({ locals }) => {
  const env = locals.runtime.env;
  const rows = await env.DB.prepare(
    `SELECT id, title_en, title_it, title_ru, desc_en, desc_it, desc_ru, start_date, end_date,
            categories, venue, lat, lng, cover_image, free, gem
       FROM events WHERE status = 'published' ORDER BY start_date LIMIT 500`,
  ).all<Row>();
  const events = (rows.results ?? []).map(toCompact);
  return Response.json(events, { headers: { 'cache-control': 'public, max-age=30' } });
};
