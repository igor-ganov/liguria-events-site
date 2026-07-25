// Validate + normalize the event form payload — shared by create (POST) and
// edit (PATCH) so both persist the same shape. Cover images are restricted to
// our own /uploads/ path (no arbitrary remote URLs), websites to http(s).

export type EventInput = {
  title: string;
  description: string;
  startDate: string;
  endDate: string | null;
  venue: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  cover: string | null;
  lat: number | null;
  lng: number | null;
  categoriesJson: string;
  free: 0 | 1;
};

const str = (v: unknown, max = 4000): string => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const isDate = (v: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(v);
const nul = (s: string): string | null => (s === '' ? null : s);

export const parseEventInput = (body: Record<string, unknown>): { ok: true; value: EventInput } | { ok: false; detail: string } => {
  const title = str(body.title, 200);
  const startDate = str(body.startDate, 10);
  const endDate = str(body.endDate, 10);
  if (title.length < 3 || !isDate(startDate)) {
    return { ok: false, detail: 'Title and a valid start date are required.' };
  }
  if (endDate !== '' && !isDate(endDate)) return { ok: false, detail: 'End date is malformed.' };

  const websiteRaw = str(body.website, 300);
  const coverRaw = str(body.coverImage, 500);
  const lat = Number.parseFloat(str(body.lat, 32));
  const lng = Number.parseFloat(str(body.lng, 32));
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
  const categories = Array.isArray(body.categories)
    ? body.categories.filter((c): c is string => typeof c === 'string').slice(0, 6)
    : [];

  return {
    ok: true,
    value: {
      title,
      description: str(body.description),
      startDate,
      endDate: nul(endDate),
      venue: nul(str(body.venue, 200)),
      address: nul(str(body.address, 300)),
      phone: nul(str(body.phone, 40)),
      website: /^https?:\/\//.test(websiteRaw) ? websiteRaw : null,
      cover: coverRaw.startsWith('/uploads/') ? coverRaw : null,
      lat: hasCoords ? lat : null,
      lng: hasCoords ? lng : null,
      categoriesJson: JSON.stringify(categories),
      free: body.free === true ? 1 : 0,
    },
  };
};
