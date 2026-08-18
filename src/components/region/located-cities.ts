import { queryAll } from '../../lib/dom/query-all.ts';
import type { LocatedCity } from '../../lib/region/here-target.ts';

const numberOf = (value: string | undefined): readonly number[] =>
  [Number(value ?? '')].filter((parsed) => Number.isFinite(parsed) && (value ?? '') !== '');

/** The picker's city rows that carry a point, read off the server-rendered
 *  markup — a city with no located event simply has nothing to measure. */
export const locatedCities = (list: HTMLElement): readonly LocatedCity[] =>
  queryAll(list, '.rp-city[data-lat]').flatMap((row) =>
    numberOf(row.dataset['lat']).flatMap((lat) =>
      numberOf(row.dataset['lng']).map((lng) => ({
        region: row.dataset['region'] ?? '',
        city: row.dataset['city'] ?? '',
        lat,
        lng,
      })),
    ),
  );
