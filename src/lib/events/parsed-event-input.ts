import { parseEventInput, type EventInput } from './event-input.ts';

type Parsed = ReturnType<typeof parseEventInput>;

const isAccepted = (parsed: Parsed): parsed is Extract<Parsed, { ok: true }> => parsed.ok;
const isRejected = (parsed: Parsed): parsed is Extract<Parsed, { ok: false }> => !parsed.ok;

/** The validated form payload as a 0-or-1 array, paired with the 400 the invalid
 *  case answers with. One value, so create (POST) and edit (PATCH) share the
 *  same guard: `accepted.map(persist)` runs for valid input only, and
 *  `rejection()` is the endpoints' original `{ error, detail }` response. */
export const parsedEventInput = (
  body: Record<string, unknown>,
): Readonly<{ accepted: readonly EventInput[]; rejection: () => Response }> => {
  const parsed = parseEventInput(body);
  const detail = [parsed].filter(isRejected).map((p) => p.detail).at(0) ?? '';
  return {
    accepted: [parsed].filter(isAccepted).map((p) => p.value),
    rejection: () => Response.json({ error: 'invalid', detail }, { status: 400 }),
  };
};
