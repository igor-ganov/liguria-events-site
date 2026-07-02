import { Either, Schema } from 'effect';
import { EventSchema } from '../../lib/events/event-schema.ts';
import type { CompactEvent } from '../../lib/events/event-schema.ts';

const ListSchema = Schema.Array(EventSchema);
const decodeList = Schema.decodeUnknownEither(ListSchema);

const parseJson = (text: string): unknown => {
  try {
    const value: unknown = JSON.parse(text);
    return value;
  } catch {
    return undefined;
  }
};

/** Shell: read the page's embedded JSON island; malformed → empty list. */
export const readEventsIsland = (): readonly CompactEvent[] =>
  Either.getOrElse(
    decodeList(parseJson(document.getElementById('events-data')?.textContent ?? '[]')),
    () => [],
  );
