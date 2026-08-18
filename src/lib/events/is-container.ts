import type { CompactEvent } from './event-schema.ts';

/**
 * A container event happens ONLY on the dates of its programme — a concert
 * series, a festival of three evenings — so the days in between are empty and
 * the event must not surface on them. A standalone event owns its whole span:
 * an exhibition open every day, a month-long installation.
 *
 * The programme is part of the test, not just the flag: a container whose
 * sessions never arrived has nothing to stand on, and falling back to its span
 * keeps it visible rather than hiding it from the site entirely.
 */
export const isContainer = (event: CompactEvent): boolean =>
  event.k === true && (event.p ?? []).length > 0;
