/**
 * Parser for `public/_redirects`, for the test that guards the file's shape.
 *
 * `:splat` in a destination is what carries the rest of the path across; omit it
 * and /genova/calendar/ lands at the region's feed rather than its calendar.
 */
import { branch } from '../branch.ts';

export type RedirectRule = Readonly<{
  source: string;
  destination: string;
  status: number;
}>;

/** Cloudflare applies 302 when a rule omits the status — never left to chance. */
const IMPLICIT_STATUS = 302;

const isRule = (line: string): boolean => line.length > 0 && !line.startsWith('#');

const toRule = (line: string): readonly RedirectRule[] => {
  const [source, destination, status] = line.split(/\s+/);
  return branch(source === undefined || destination === undefined)(
    () => [],
    () => [
      {
        source: source ?? '',
        destination: destination ?? '',
        status: Number(status ?? IMPLICIT_STATUS),
      },
    ],
  );
};

/** One rule per directive, in file order — order is what decides a match. */
export const parseRedirectRules = (text: string): readonly RedirectRule[] =>
  text
    .split('\n')
    .map((line) => line.trim())
    .filter(isRule)
    .flatMap(toRule);
