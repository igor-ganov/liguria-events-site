/* Vendored from @prometheus/search-core (MIT). See doc.ts for provenance. */

/*
 * Folding, with a way back. Matching happens on folded text; a snippet is
 * quoted from the ORIGINAL, so we record where each folded character came from.
 */

/* Combining marks left behind by the NFD decomposition. */
const COMBINING = /\p{M}+/gu;

/* A letter or a digit survives folding; anything else is a separator. */
const KEEPS = /[\p{L}\p{N}]/u;

/** Folded text, plus where each of its characters came from. */
export interface Folded {
  readonly text: string;
  /** `source[map[i]]` is the character `text[i]` was folded from. */
  readonly map: readonly number[];
}

/*
 * `й` is a LETTER, not an accented `и` — but NFD decomposes it into `и` plus a
 * combining breve, and the strip below would then eat it. `ё → е` is the
 * opposite case, and deliberate: a spelling variant readers substitute freely.
 */
const foldChar = (ch: string): string => {
  const lower = ch.toLowerCase();
  if (lower === 'ё') return 'е';
  if (lower === 'й') return 'й';
  return lower.normalize('NFD').replace(COMBINING, '');
};

/**
 * Fold text for matching, keeping a map back to the source.
 * @param raw - Any user- or content-supplied text.
 * @returns The folded text and, per character, its source offset.
 */
export const foldWithMap = (raw: string): Folded => {
  const out: string[] = [];
  const map: number[] = [];
  for (let at = 0; at < raw.length; at += 1) {
    const folded = foldChar(raw[at] ?? '');
    if (folded === '') continue;
    if (!KEEPS.test(folded)) {
      /* Collapse a run of separators into a single space. */
      if (out.at(-1) === ' ') continue;
      out.push(' ');
      map.push(at);
      continue;
    }
    for (const ch of folded) {
      out.push(ch);
      map.push(at);
    }
  }
  return { text: out.join(''), map };
};
