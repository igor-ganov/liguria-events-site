import { branch } from '../branch.ts';
import { regionsAndCitiesOf } from './regions-cities-of.ts';
import type { CompactEvent } from '../events/event-schema.ts';

/** Every city the site recognises, grouped by region. */
export type PlaceIndex = Readonly<Record<string, readonly string[]>>;

const isStringArray = (value: unknown): value is readonly string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

/** The cities visible in the events themselves — the fallback, and what the
 *  site used to use as its only source. */
const citiesInEvents = (events: readonly CompactEvent[]): PlaceIndex =>
  Object.fromEntries(
    regionsAndCitiesOf(events).map((group) => [group.slug, group.cities.map((city) => city.slug)]),
  );

/**
 * The canonical list if the collector answers, the cities we can see otherwise.
 *
 * The fallback matters: without it an outage of the place endpoint would delete
 * every city page from the next build, which is a far worse failure than the
 * one being fixed.
 */
export const placeIndex = (parsed: unknown, events: readonly CompactEvent[]): PlaceIndex => {
  const entries = Object.entries(Object(parsed)).flatMap(([region, cities]) =>
    [cities].filter(isStringArray).map((slugs) => [region, slugs] as const),
  );
  return branch(entries.length === 0)(
    () => citiesInEvents(events),
    () => Object.fromEntries(entries),
  );
};
