import { branch } from '../branch.ts';
import type { CompactEvent } from './event-schema.ts';

/** Google-Maps-geocodable location for an event — the enriched address when
 *  present, else the venue scoped to Genoa; undefined when neither is known. */
export const mapQuery = (event: CompactEvent): string | undefined =>
  event.a ??
  branch(event.v === undefined)(
    () => undefined,
    () => `${event.v}, Genova, Italy`,
  );
