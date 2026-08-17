/* Vendored from @prometheus/search-core (MIT). See doc.ts for provenance. */

/* A letter or a digit survives folding; anything else is a separator. */
const KEEPS = /[\p{L}\p{N}]/u;

/** How a folded character joins the output. `swallowed` is a separator that
 *  follows one already emitted — a run of separators collapses into one space. */
type Kind = 'gone' | 'swallowed' | 'separator' | 'kept';

type Rule = Readonly<{ kind: Kind; when: (folded: string, lastOut: string | undefined) => boolean }>;

// First match wins, so the order is the order of the guard clauses this replaces.
const RULES: readonly Rule[] = [
  { kind: 'gone', when: (folded) => folded === '' },
  { kind: 'swallowed', when: (folded, lastOut) => !KEEPS.test(folded) && lastOut === ' ' },
  { kind: 'separator', when: (folded) => !KEEPS.test(folded) },
  { kind: 'kept', when: () => true },
];

const EMIT: Readonly<Record<Kind, (folded: string) => readonly string[]>> = {
  gone: () => [],
  swallowed: () => [],
  separator: () => [' '],
  kept: (folded) => [...folded],
};

/** The characters one folded source character contributes to the folded text:
 *  none for a character that folds away or a separator the previous space
 *  already covers, a single space for a fresh separator, its own characters
 *  otherwise. `lastOut` is the character emitted last, if any. */
export const foldContribution = (folded: string, lastOut: string | undefined): readonly string[] =>
  EMIT[RULES.find((rule) => rule.when(folded, lastOut))?.kind ?? 'kept'](folded);
