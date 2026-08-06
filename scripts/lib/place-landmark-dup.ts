/*
 * Cross-layer dedupe: the same cultural institution (a museum, gallery,
 * theatre or cinema) is collected by BOTH pipelines — build-landmarks (Wikidata
 * + OSM `tourism`) and build-places (OSM `amenity=theatre`/`tourism=museum`).
 * The map renders landmarks and places as two disjoint Supercluster layers that
 * never co-cluster, so such a POI shows as two markers a few metres apart: they
 * read as "two" zoomed out and overlap into "one" zoomed in. Landmarks are the
 * curated, photo-bearing layer, so the landmark wins and the duplicate place is
 * dropped.
 *
 * Only the venue categories that genuinely overlap the landmark layer are
 * considered — a bar named after its piazza ("Piazza Banchi") or a café named
 * "San Martino" next to the church share a name with a nearby landmark but are
 * distinct venues, and must be kept.
 */

// Place categories that name a cultural institution also present as a landmark.
// Deliberately excludes bar/cafe/restaurant/sport/kids/… — those name-collide
// with squares and churches without being the same entity.
export const CULTURAL_DUP_CATS: ReadonlySet<string> = new Set([
  'museum',
  'gallery',
  'entertainment',
  'cinema',
]);

// Same normaliser build-places/build-landmarks use for name comparison.
export const normName = (s: string): string =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();

// Square/street names ("Piazza Sant'Eusebio", "Via Garibaldi") can contain a
// landmark's name yet denote the open space, not the institution — never a
// museum/theatre. A place whose only name starts this way is not a duplicate.
const LOCALITY_PREFIXES: ReadonlySet<string> = new Set([
  'piazza', 'piazzetta', 'via', 'viale', 'largo', 'corso',
  'salita', 'vico', 'calata', 'spianata', 'belvedere', 'lungomare',
]);

const isLocalityName = (name: string): boolean =>
  LOCALITY_PREFIXES.has(normName(name).split(' ')[0] ?? '');

export type LandmarkPoint = Readonly<{ lat: number; lng: number; names: readonly string[] }>;

// A spatial grid so each place checks only landmarks in its own cell (±1),
// not the whole region — the naive scan is O(places × landmarks) and times out
// on the big regions. Cell ≈ 0.0025° (~275m) comfortably contains the 45m test.
export type LandmarkIndex = ReadonlyMap<string, readonly LandmarkPoint[]>;

const CELL = 0.0025;
const cellKey = (lat: number, lng: number): string => `${Math.round(lat / CELL)}:${Math.round(lng / CELL)}`;

export const indexLandmarks = (landmarks: readonly LandmarkPoint[]): LandmarkIndex => {
  const grid = new Map<string, LandmarkPoint[]>();
  for (const l of landmarks) {
    const k = cellKey(l.lat, l.lng);
    (grid.get(k) ?? grid.set(k, []).get(k)!).push(l);
  }
  return grid;
};

const nearbyLandmarks = (index: LandmarkIndex, lat: number, lng: number): readonly LandmarkPoint[] => {
  const ci = Math.round(lat / CELL);
  const cj = Math.round(lng / CELL);
  const out: LandmarkPoint[] = [];
  for (let di = -1; di <= 1; di += 1) {
    for (let dj = -1; dj <= 1; dj += 1) {
      const bucket = index.get(`${ci + di}:${cj + dj}`);
      if (bucket) out.push(...bucket);
    }
  }
  return out;
};

const EARTH_R = 6371000;
const rad = (d: number): number => (d * Math.PI) / 180;

export const metersBetween = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number => {
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_R * Math.asin(Math.sqrt(a));
};

// Equal, or one name is a substring of the other (with a length floor so a
// short generic token cannot swallow a long landmark name).
const nameMatches = (placeName: string, landmarkNames: readonly string[]): boolean => {
  const p = normName(placeName);
  if (p === '') return false;
  return landmarkNames.some((raw) => {
    const l = normName(raw);
    if (l === '') return false;
    if (p === l) return true;
    if (l.length >= 5 && p.includes(l)) return true;
    if (p.length >= 5 && l.includes(p)) return true;
    return false;
  });
};

/**
 * A place is a landmark duplicate when it is a cultural-venue category, sits
 * within `maxMeters` of a landmark, and shares (or contains) that landmark's
 * name in some locale. `names` may hold the place's name in several locales;
 * any one matching is enough. `index` is built once via `indexLandmarks`.
 */
export const isLandmarkDuplicate = (
  place: Readonly<{ cat: string; names: readonly string[]; lat: number; lng: number }>,
  index: LandmarkIndex,
  maxMeters = 45,
): boolean => {
  if (!CULTURAL_DUP_CATS.has(place.cat)) return false;
  const names = place.names.filter((n) => !isLocalityName(n));
  if (names.length === 0) return false;
  return nearbyLandmarks(index, place.lat, place.lng).some(
    (l) =>
      metersBetween(place.lat, place.lng, l.lat, l.lng) <= maxMeters &&
      names.some((n) => nameMatches(n, l.names)),
  );
};
