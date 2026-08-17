/* Vendored from @prometheus/search-core (MIT). See doc.ts for provenance. */
import { branch } from '../branch.ts';

/*
 * Bounded Levenshtein. The scorer runs this against every unique token of every
 * document, so the bound is what makes the whole approach affordable: a row
 * whose every path already costs more than the bound abandons the walk.
 */

type Row = readonly number[];

const upTo = (n: number): readonly number[] => Array.from({ length: n }, (_, i) => i + 1);

const nextRow = (a: string, b: string, i: number, prev: Row): Row => {
  const row: number[] = [i];
  for (const j of upTo(b.length)) {
    const cost = Number(a[i - 1] !== b[j - 1]);
    row.push(Math.min((row[j - 1] ?? 0) + 1, (prev[j] ?? 0) + 1, (prev[j - 1] ?? 0) + cost));
  }
  return row;
};

const keep = (row: Row, max: number): Row | undefined =>
  branch(Math.min(...row) > max)<Row | undefined>(
    () => undefined,
    () => row,
  );

const step =
  (a: string, b: string, max: number) =>
  (prev: Row | undefined, i: number): Row | undefined =>
    prev && keep(nextRow(a, b, i, prev), max);

const lastRow = (a: string, b: string, max: number): Row | undefined =>
  upTo(a.length).reduce<Row | undefined>(
    step(a, b, max),
    Array.from({ length: b.length + 1 }, (_, i) => i),
  );

const within = (distance: number, max: number): number | undefined =>
  branch(distance > max)<number | undefined>(
    () => undefined,
    () => distance,
  );

/**
 * Edit distance between two words, abandoned as soon as it exceeds `max`.
 * @param a - First word (normalized).
 * @param b - Second word (normalized).
 * @param max - Bound; beyond it the answer is not worth computing.
 * @returns The distance, or undefined when it exceeds `max`.
 */
export const editDistanceWithin = (a: string, b: string, max: number): number | undefined =>
  branch(Math.abs(a.length - b.length) > max)<number | undefined>(
    () => undefined,
    () => within(lastRow(a, b, max)?.[b.length] ?? Number.POSITIVE_INFINITY, max),
  );
