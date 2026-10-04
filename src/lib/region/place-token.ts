import { branch } from '../branch.ts';

// The two shapes the sender understands. Anything else it reads as "the whole
// country", which is how a reader who asked about their own area ends up being
// told about Palermo.
const KINDS = ['region:', 'city:'];

/** A place as the push sender reads it: `region:lombardia`, `city:genova`. */
export const placeToken = (value: string): string => {
  const trimmed = value.trim();
  return branch(trimmed === '' || KINDS.some((kind) => trimmed.startsWith(kind)))(
    () => trimmed,
    () => `region:${trimmed}`,
  );
};
