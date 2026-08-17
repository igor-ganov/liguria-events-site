/** A 0-or-1 array holding the value only when it is truthy — the branch-free
 *  stand-in for `if (value) …`. Follow it with `.map(use).at(0)` to spread an
 *  optional property, or with `.at(0) ?? fallback` to pick a default. Empty
 *  strings, 0 and the database's empty marker all read as absent, exactly as a
 *  truthiness guard did. */
export const truthy = <T>(value: T): readonly NonNullable<T>[] =>
  [value].filter((candidate): candidate is NonNullable<T> => Boolean(candidate));
