import { Either, Schema } from 'effect';
import type { Tip } from './tip.ts';

const TipsFile = Schema.Struct({
  tips: Schema.Array(Schema.Struct({ kind: Schema.Literal('place', 'event', 'site'), text: Schema.String })),
});

/** The tips in a fetched file. Untrusted input: anything that does not match
 *  is no tips at all, never an exception in the middle of a navigation. */
export const decodeTips = (input: unknown): readonly Tip[] =>
  Either.getOrElse(
    Either.map(Schema.decodeUnknownEither(TipsFile)(input), (file) => file.tips),
    () => [],
  );
