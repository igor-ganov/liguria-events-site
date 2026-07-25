// D1 event rows → the feed's CompactEvent wire shape. Shared by the
// published-events API (feed augmentation) and the SSR event-detail route, so a
// user-submitted event resolves the same way in both places.

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

const COLUMNS =
  'id, title_en, title_it, title_ru, desc_en, desc_it, desc_ru, start_date, end_date, ' +
  'categories, venue, lat, lng, cover_image, free, gem';

const loc = (en: string | null, it: string | null, ru: string | null): { en: string; it: string; ru: string } => {
  const base = en ?? '';
  return { en: base, it: it ?? base, ru: ru ?? base };
};

const parseCats = (raw: string | null): string[] => {
  try {
    const parsed = JSON.parse(raw ?? '[]') as unknown;
    return Array.isArray(parsed) ? parsed.filter((c): c is string => typeof c === 'string') : [];
  } catch {
    return [];
  }
};

/** One D1 row → a CompactEvent-shaped object (decode-event-list validates it). */
export const toCompact = (r: Row): Record<string, unknown> => {
  const cats = parseCats(r.categories);
  const event: Record<string, unknown> = {
    id: r.id,
    t: r.title_en ?? '',
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

/** Published events (feed corpus supplement), newest start first, capped. */
export const publishedEvents = async (db: D1Database): Promise<Record<string, unknown>[]> => {
  const rows = await db
    .prepare(`SELECT ${COLUMNS} FROM events WHERE status = 'published' ORDER BY start_date LIMIT 500`)
    .all<Row>();
  return (rows.results ?? []).map(toCompact);
};

/** A single published event by id, or undefined — for the SSR detail route. */
export const publishedEventById = async (db: D1Database, id: string): Promise<Record<string, unknown> | undefined> => {
  const row = await db.prepare(`SELECT ${COLUMNS} FROM events WHERE id = ? AND status = 'published'`).bind(id).first<Row>();
  return row ? toCompact(row) : undefined;
};

// Author-preview: a published event is visible to everyone; a not-yet-published
// one (pending/held/rejected) only to its author, so the post-submit redirect
// lands on a real page instead of a 404 while moderation runs.
export type EventContacts = { address?: string; phone?: string; website?: string };

export const eventForDetail = async (
  db: D1Database,
  id: string,
  viewerId?: string,
): Promise<{ compact: Record<string, unknown>; status: string; owned: boolean; contacts: EventContacts } | undefined> => {
  const row = await db
    .prepare(`SELECT ${COLUMNS}, address, phone, website, status, submitter_id FROM events WHERE id = ?`)
    .bind(id)
    .first<Row & { address: string | null; phone: string | null; website: string | null; status: string; submitter_id: string | null }>();
  if (!row) return undefined;
  const owned = viewerId !== undefined && row.submitter_id === viewerId;
  if (row.status !== 'published' && !owned) return undefined;
  const contacts: EventContacts = {
    ...(row.address ? { address: row.address } : {}),
    ...(row.phone ? { phone: row.phone } : {}),
    ...(row.website ? { website: row.website } : {}),
  };
  return { compact: toCompact(row), status: row.status, owned, contacts };
};

export type EventFormValues = {
  title: string; description: string; startDate: string; endDate: string; venue: string;
  categories: string[]; free: boolean; coverImage: string; address: string; phone: string;
  website: string; lat: string; lng: string;
};

/** The author's own event as editable form values, or undefined if not theirs. */
export const editableEventById = async (
  db: D1Database,
  id: string,
  userId: string,
): Promise<EventFormValues | undefined> => {
  const row = await db
    .prepare('SELECT title_en, desc_en, start_date, end_date, venue, categories, free, cover_image, address, phone, website, lat, lng, submitter_id FROM events WHERE id = ?')
    .bind(id)
    .first<{
      title_en: string | null;
      desc_en: string | null;
      start_date: string;
      end_date: string | null;
      venue: string | null;
      categories: string | null;
      free: number;
      cover_image: string | null;
      address: string | null;
      phone: string | null;
      website: string | null;
      lat: number | null;
      lng: number | null;
      submitter_id: string | null;
    }>();
  if (!row || row.submitter_id !== userId) return undefined;
  return {
    title: row.title_en ?? '',
    description: row.desc_en ?? '',
    startDate: row.start_date,
    endDate: row.end_date ?? '',
    venue: row.venue ?? '',
    categories: parseCats(row.categories),
    free: row.free === 1,
    coverImage: row.cover_image ?? '',
    address: row.address ?? '',
    phone: row.phone ?? '',
    website: row.website ?? '',
    lat: row.lat === null ? '' : String(row.lat),
    lng: row.lng === null ? '' : String(row.lng),
  };
};
