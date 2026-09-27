const quality = (part: string): number => Number(/;\s*q=([0-9.]+)/.exec(part)?.[1] ?? '1');

const tagOf = (part: string): string => part.split(';').at(0)?.trim().toLowerCase() ?? '';

/**
 * The language tags of an Accept-Language header, best-liked first.
 *
 * q=0 means "not this one" and is dropped rather than ranked last, which is the
 * one part of the grammar that changes an answer rather than its order.
 */
export const rankedLanguages = (header: string | undefined): readonly string[] =>
  (header ?? '')
    .split(',')
    .map((part) => ({ tag: tagOf(part), q: quality(part) }))
    .filter(({ tag, q }) => tag.length > 0 && q > 0)
    .sort((left, right) => right.q - left.q)
    .map(({ tag }) => tag);
