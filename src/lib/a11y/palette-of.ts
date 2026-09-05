const DECLARATION = /--([a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g;

/** The text between a selector and the end of its block. Found by searching
 *  rather than by a regex built from the selector: a selector carries
 *  brackets and quotes, and escaping it into a pattern is a bug waiting for
 *  the first token block that uses an attribute. */
const blockOf = (css: string, selector: string): string =>
  [css.indexOf(`${selector} {`)]
    .filter((start) => start >= 0)
    .map((start) => css.slice(start, css.indexOf('}', start)))
    .at(0) ?? '';

/**
 * The colour tokens declared in one block of a stylesheet.
 *
 * Deliberately not a CSS parser: it reads the hex literals out of a single
 * block, which is exactly what a palette is. Anything computed from another
 * token is out of scope, and is what the browser sweep is for.
 */
export const paletteOf = (css: string, selector: string): Readonly<Record<string, string>> =>
  Object.fromEntries(
    [...blockOf(css, selector).matchAll(DECLARATION)].map((match) => [match[1] ?? '', match[2] ?? '']),
  );
