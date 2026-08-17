import { CATEGORIES } from './categories.ts';
import type { Category } from './categories.ts';

/**
 * Narrow an untrusted string — a `cat=` query value, a chip's data attribute —
 * to a known category. The filtering counterpart of toCategory(): where that
 * folds an unknown value into 'other', this DROPS it, which is what a filter
 * list wants (a bogus category must select nothing, not select 'other').
 */
export const isCategory = (value: string | undefined): value is Category =>
  CATEGORIES.some((category) => category === value);
