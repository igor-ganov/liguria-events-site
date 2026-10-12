type Scan = Readonly<{ blocks: readonly string[]; from: number; depth: number; comment: boolean }>;

const START: Scan = { blocks: [], from: 0, depth: 0, comment: false };

// One character of the sheet. Inside a comment nothing counts; outside, a
// closing brace that brings the depth back to zero ends a top-level rule.
const step = (css: string) => (scan: Scan, _: string, at: number): Scan => {
  const opens = !scan.comment && css.startsWith('/*', at);
  const closes = scan.comment && css.startsWith('*/', at - 1);
  const quiet = scan.comment || opens;
  const depth = scan.depth + Number(!quiet && css[at] === '{') - Number(!quiet && css[at] === '}');
  const ended = !quiet && css[at] === '}' && depth === 0;
  return {
    blocks: ended ? [...scan.blocks, css.slice(scan.from, at + 1)] : scan.blocks,
    from: ended ? at + 1 : scan.from,
    depth,
    comment: (scan.comment || opens) && !closes,
  };
};

/**
 * A stylesheet cut into its top-level rules, in order. Each piece carries the
 * comment written over it, and a rule with rules inside it — a media query —
 * is one piece. Joined back together the pieces are the sheet, to the byte:
 * whatever follows the last rule stays with it.
 */
export const cssBlocks = (css: string): readonly string[] => {
  const scan = [...css].reduce(step(css), START);
  const rest = css.slice(scan.from);
  const last = scan.blocks.at(-1);
  return last === undefined ? [rest].filter((text) => text !== '') : [...scan.blocks.slice(0, -1), last + rest];
};
