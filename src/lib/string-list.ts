/** The strings of an unknown value that is an array, in order. Anything that is
 *  not an array — and every non-string member of one — reads as nothing. */
export const stringList = (value: unknown): readonly string[] =>
  [value]
    .filter((candidate): candidate is readonly unknown[] => Array.isArray(candidate))
    .map((list) => list.filter((item): item is string => typeof item === 'string'))
    .at(0) ?? [];
