/* Vendored from @prometheus/search-core (MIT). See doc.ts for provenance. */
import { foldChar } from './fold-char.ts';
import { foldContribution } from './fold-contribution.ts';

/*
 * Folding, with a way back. Matching happens on folded text; a snippet is
 * quoted from the ORIGINAL, so we record where each folded character came from.
 */

/** Folded text, plus where each of its characters came from. */
export interface Folded {
  readonly text: string;
  /** `source[map[i]]` is the character `text[i]` was folded from. */
  readonly map: readonly number[];
}

/**
 * Fold text for matching, keeping a map back to the source.
 *
 * Walks UTF-16 code units, not code points, on purpose: a lone surrogate folds
 * to itself, fails the letter test and so reads as a separator — which is how
 * an emoji has always been treated here.
 * @param raw - Any user- or content-supplied text.
 * @returns The folded text and, per character, its source offset.
 */
export const foldWithMap = (raw: string): Folded => {
  const out: string[] = [];
  const map: number[] = [];
  Array.from({ length: raw.length }, (_unused, at) => at).forEach((at) => {
    foldContribution(foldChar(raw[at] ?? ''), out.at(-1)).forEach((ch) => {
      out.push(ch);
      map.push(at);
    });
  });
  return { text: out.join(''), map };
};
