// A POI id (landmark/place) does not encode its region, and the favourites page
// / route builder would otherwise have to search every region shard to render
// it. So when a POI is favourited we also stash the little it takes to render it
// — captured from the page, which already has it — in a parallel localStorage
// map keyed by id. Events keep resolving from the corpus; this is POIs only.
export type FavPoi = Readonly<{
  id: string;
  kind: 'landmark' | 'place';
  region: string;
  name: string;
  lat: number;
  lng: number;
  cat: string; // landmark kind or place category
  url: string; // localized detail path
}>;

const KEY = 'dovego:fav-pois';

const field = (obj: unknown, key: string): unknown => (Object(obj) === obj ? Reflect.get(Object(obj), key) : undefined);
const num = (v: unknown): number | undefined => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);
const str = (v: unknown): string | undefined => (typeof v === 'string' ? v : undefined);

const parsePoi = (v: unknown): FavPoi | undefined => {
  const id = str(field(v, 'id'));
  const name = str(field(v, 'name'));
  const url = str(field(v, 'url'));
  const lat = num(field(v, 'lat'));
  const lng = num(field(v, 'lng'));
  const kind = field(v, 'kind') === 'place' ? 'place' : 'landmark';
  if (id === undefined || name === undefined || url === undefined || lat === undefined || lng === undefined) return undefined;
  return { id, kind, region: str(field(v, 'region')) ?? 'liguria', name, lat, lng, cat: str(field(v, 'cat')) ?? '', url };
};

export const readFavPois = (): Readonly<Record<string, FavPoi>> => {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    const out: Record<string, FavPoi> = {};
    if (raw && typeof raw === 'object') {
      for (const value of Object.values(raw)) {
        const poi = parsePoi(value);
        if (poi) out[poi.id] = poi;
      }
    }
    return out;
  } catch {
    return {};
  }
};

const write = (map: Readonly<Record<string, FavPoi>>): void => {
  try {
    localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    /* storage blocked — ignore */
  }
};

export const setFavPoi = (poi: FavPoi): void => write({ ...readFavPois(), [poi.id]: poi });

export const deleteFavPoi = (id: string): void => {
  const map = { ...readFavPois() };
  if (id in map) {
    delete map[id];
    write(map);
  }
};

/** Parse the JSON a POI favourite button carries in data-fav-poi. */
export const parseFavPoiAttr = (json: string | undefined): FavPoi | undefined => {
  if (!json) return undefined;
  try {
    return parsePoi(JSON.parse(json));
  } catch {
    return undefined;
  }
};
