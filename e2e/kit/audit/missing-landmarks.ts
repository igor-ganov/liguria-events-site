/**
 * What a page was supposed to have and does not.
 *
 * The check exists because the loudest layout regressions are subtractive: a
 * header that stops rendering at one width, a footer pushed out of the
 * document. Nothing throws, and a screenshot of the part that is left looks
 * fine.
 */
export const missingLandmarks = (
  required: readonly string[],
  present: readonly string[],
): readonly string[] => required.filter((landmark) => !present.includes(landmark));
