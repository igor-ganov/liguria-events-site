import { Effect, pipe } from 'effect';
import { decodeEventsPayload } from '../lib/events/decode-events.ts';
import type { EventsPayload } from '../lib/events/decode-events.ts';

/**
 * Build-time pipeline (AC-1.1): fetch → HTTP gate → JSON → Schema. Any
 * failure fails the build loudly — Pages keeps serving the previous deploy.
 */
export const loadEvents = (url: string): Effect.Effect<EventsPayload, Error> =>
  pipe(
    Effect.tryPromise({
      try: () => fetch(url),
      catch: (cause) => new Error(`events fetch failed: ${String(cause)}`),
    }),
    Effect.filterOrFail(
      (response) => response.ok,
      (response) => new Error(`events endpoint returned ${response.status}`),
    ),
    Effect.flatMap((response) =>
      Effect.tryPromise({
        try: (): Promise<unknown> => response.json(),
        catch: (cause) => new Error(`events payload is not JSON: ${String(cause)}`),
      }),
    ),
    Effect.flatMap((payload) =>
      pipe(
        decodeEventsPayload(payload),
        Effect.mapError((issue) => new Error(`events payload rejected: ${String(issue)}`)),
      ),
    ),
  );
