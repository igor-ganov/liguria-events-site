import { cssBlocks } from './css-blocks.ts';
import { styledClasses } from './styled-classes.ts';

const COMMENT = /\/\*[\s\S]*?\*\//g;
// The at-rules that hold ordinary rules, which are judged one by one. Any other
// at-rule (an animation, a font, a registered property) is kept whole.
const HOLDS_RULES = /^@(media|supports|container|layer)\b/;

// A selector list cut at its commas — the ones that separate selectors, not
// the ones inside :is(…) or :not(…).
const selectorsOf = (prelude: string): readonly string[] =>
  [...prelude].reduce<Readonly<{ parts: readonly string[]; depth: number }>>(
    ({ parts, depth }, char) => {
      const next = depth + Number(char === '(') - Number(char === ')');
      const cut = char === ',' && depth === 0;
      return {
        parts: cut ? [...parts, ''] : [...parts.slice(0, -1), `${parts.at(-1) ?? ''}${char}`],
        depth: next,
      };
    },
    { parts: [''], depth: 0 },
  ).parts;

/**
 * One top-level piece of a stylesheet as a page is sent it: whole, in part, or
 * not at all (an empty string).
 *
 * `concerns` says whether a selector can match anything on the page. A rule is
 * kept when any selector of its list can — `:root, .map-pin` is the root's rule
 * on a page with no map. A media query is opened and its rules are judged the
 * same way; left with none, it is not written.
 */
export const keptCss = (concerns: (selector: string) => boolean) => {
  const kept = (block: string): string => {
    const bare = block.replace(COMMENT, '');
    const open = bare.indexOf('{');
    const prelude = bare.slice(0, Math.max(open, 0)).trim();
    const nested = HOLDS_RULES.test(prelude);
    const plain = !prelude.startsWith('@');
    return nested ? within(block) : plain && !selectorsOf(prelude).some(concerns) ? '' : block;
  };
  // The head and the closing brace of the block are kept as written, comments
  // and all; only what stands between them is cut.
  const within = (block: string): string => {
    const open = block.indexOf('{', block.search(/@(media|supports|container|layer)\b/));
    const close = block.lastIndexOf('}');
    const inner = cssBlocks(block.slice(open + 1, close)).map(kept).join('');
    return inner.trim() === '' ? '' : `${block.slice(0, open + 1)}${inner}${block.slice(close)}`;
  };
  return kept;
};

/** The classes one selector names — the test `concerns` is usually built on. */
export const classesIn = (selector: string): readonly string[] => styledClasses(`${selector}{}`);
