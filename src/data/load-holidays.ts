import { Effect, pipe } from 'effect';
import { decodeHolidaysPayload } from '../lib/holidays/decode-holidays.ts';
import type { HolidaysPayload } from '../lib/holidays/decode-holidays.ts';

const NONE: HolidaysPayload = { generatedAt: '', holidays: [] };

/**
 * fetch → HTTP gate → JSON → Schema, like the corpus — but a holiday is a
 * decoration, so any failure (the job not shipped yet, a 404, a bad payload)
 * means "no holiday" and the site renders as it always has. Never rejects.
 */
export const loadHolidays = (url: string): Promise<HolidaysPayload> =>
  Effect.runPromise(
    pipe(
      Effect.tryPromise(() => fetch(url)),
      Effect.filterOrFail((response) => response.ok),
      Effect.flatMap((response) => Effect.tryPromise((): Promise<unknown> => response.json())),
      Effect.flatMap(decodeHolidaysPayload),
      Effect.orElseSucceed(() => NONE),
    ),
  );
