import { isDefined } from '../is-defined.ts';
import { jsonValue } from '../json-value.ts';
import { parseSessions } from './parse-sessions.ts';
import { programmeSpan } from './programme-span.ts';
import { trimmedString } from '../trimmed-string.ts';
import type { Session } from './event-schema.ts';

type Span = Readonly<{
  startDate: string;
  endDate: string;
  container: boolean;
  sessions: readonly Session[];
}>;

/**
 * The when of the draft: the kind, the programme, and the run.
 *
 * A container's run is not typed in — it is first-to-last of the dates the
 * author listed, so the form cannot claim a festival lasts all August when it
 * plays three evenings. A standalone event keeps the dates as submitted.
 */
export const draftSpan = (body: unknown): Span => {
  const container = jsonValue(body, 'kind') === 'container';
  const sessions = parseSessions(jsonValue(body, 'sessions'));
  const derived = [programmeSpan(sessions)]
    .filter(() => container)
    .filter(isDefined)
    .map((span) => ({
      startDate: span.startDate,
      // One evening is a one-day event, not a zero-length run.
      endDate: [span.endDate].filter((end) => end !== span.startDate).at(0) ?? '',
    }));
  return {
    startDate: derived.at(0)?.startDate ?? trimmedString(jsonValue(body, 'startDate'), 10),
    endDate: derived.at(0)?.endDate ?? trimmedString(jsonValue(body, 'endDate'), 10),
    container,
    sessions,
  };
};
