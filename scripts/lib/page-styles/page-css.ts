import { cssBlocks } from './css-blocks.ts';
import { classesIn, keptCss } from './kept-css.ts';
import { reachedFiles } from './reached-files.ts';

type Input = Readonly<{
  /** The stylesheets, in the order the page would have loaded them. */
  sheets: readonly string[];
  /** Every source file of the site, by path. */
  files: ReadonlyMap<string, string>;
  /** Where an import written in one file leads, when it leads to a source file. */
  resolve: (from: string, spec: string) => string | undefined;
}>;

// Every run of letters, digits, hyphens and underscores in a file: a class is
// written in it when one of those runs is exactly its name.
const WORD = /[\w-]+/g;

const writtenIn = (files: ReadonlyMap<string, string>): ReadonlyMap<string, readonly string[]> => {
  const index = new Map<string, string[]>();
  files.forEach((text, path) =>
    new Set(text.match(WORD) ?? []).forEach((word) => {
      index.set(word, [...(index.get(word) ?? []), path]);
    }),
  );
  return index;
};

/**
 * The styles one page is sent: every rule of the sheets, in their order, except
 * the ones that can be shown not to concern it.
 *
 * A rule concerns a page when a class it selects by is written in a file the
 * page reaches through its imports — markup, a script that builds markup, a
 * helper three imports down. A rule whose classes are written nowhere in the
 * source (a library draws them, or they are put together from pieces) cannot
 * be placed, and neither can a rule with no class at all; both stay on every
 * page. So a rule is only ever left out on evidence, never on a guess.
 */
export const pageCss = ({ sheets, files, resolve }: Input): ((page: string) => string) => {
  const blocks = sheets.flatMap(cssBlocks);
  const where = writtenIn(files);
  const reach = reachedFiles(files, resolve);
  return (page) => {
    const mine = reach(page);
    const reachedBy = (name: string): boolean => (where.get(name) ?? []).some((file) => mine.has(file));
    const placed = (name: string): boolean => (where.get(name) ?? []).length > 0;
    // A selector whose classes are written nowhere cannot be placed and is
    // taken to concern every page; otherwise one of them must be within reach.
    const concerns = (selector: string): boolean => {
      const classes = classesIn(selector);
      return !classes.some(placed) || classes.some(reachedBy);
    };
    return blocks.map(keptCss(concerns)).join('');
  };
};
