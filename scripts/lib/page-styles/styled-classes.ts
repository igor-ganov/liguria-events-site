const COMMENT = /\/\*[\s\S]*?\*\//g;
// What stands before an opening brace: a selector list, or the head of an
// at-rule. Values never do, so a decimal or a file name is never read as a class.
const PRELUDE = /(?<=^|[{}])([^{}]*)\{/g;
const CLASS = /\.(-?[a-zA-Z_][\w-]*)/g;

/** Every class a rule selects by, in the order first met — including the
 *  rules a media query holds. */
export const styledClasses = (block: string): readonly string[] => [
  ...new Set(
    [...block.replace(COMMENT, '').matchAll(PRELUDE)].flatMap((prelude) =>
      [...(prelude[1] ?? '').matchAll(CLASS)].map((found) => found[1] ?? ''),
    ),
  ),
];
