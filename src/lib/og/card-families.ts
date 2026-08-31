/**
 * The families the card asks for. A renderer with no system fonts matches on
 * this name and nothing else, and a miss is silent: it falls back to another
 * loaded face and draws a card that looks almost right.
 *
 * The name to use is the face's typographic family — name id 16 where it
 * exists, id 1 otherwise — which is not what the file calls itself. Fraunces
 * here is "Fraunces 72pt" and will not answer to "Fraunces"; Rubik Medium is
 * "Rubik" and will not answer to "Rubik Medium". Getting either wrong sets the
 * whole card in the other face.
 *
 * Pinned by rendering, in test/og-render.test.ts.
 */
export const CARD_FAMILIES = {
  /** Fraunces at the 72pt optical size: the display cut, for 64px type. */
  title: 'Fraunces 72pt',
  /** Rubik Medium — weight 500 is the only cut bundled, and the only Cyrillic. */
  text: 'Rubik',
} as const;
