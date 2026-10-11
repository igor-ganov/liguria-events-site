const wordsIn = (text: string): readonly string[] =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word !== '');

/**
 * Whether a piece of text adds nothing to what the page already says about the
 * place: every word of it is a word of the venue, the address or the town. The
 * "getting there" part of a description is very often the address again, and
 * shown under a map that carries the address it is the same line twice.
 */
export const saysNoMore = (text: string, known: readonly string[]): boolean => {
  const have = new Set(known.flatMap(wordsIn));
  return wordsIn(text).every((word) => have.has(word));
};
