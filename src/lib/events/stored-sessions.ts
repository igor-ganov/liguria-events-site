import { parseSessions } from './parse-sessions.ts';
import type { Session } from './event-schema.ts';

// A stored programme that no longer parses is treated as no programme at all —
// the event falls back to its plain run rather than disappearing from the site.
const parsed = (json: string): readonly unknown[] => {
  try {
    return [JSON.parse(json)];
  } catch {
    return [];
  }
};

/**
 * The programme off a stored column, validated the same way the form payload is,
 * so a hand-edited row cannot smuggle a shape past the reader. The column is
 * read as `unknown` because the driver hands back its own empty marker for an
 * unset value, which is not a string.
 */
export const storedSessions = (value: unknown): readonly Session[] =>
  [value]
    .filter((json): json is string => typeof json === 'string' && json !== '')
    .flatMap(parsed)
    .flatMap(parseSessions);
