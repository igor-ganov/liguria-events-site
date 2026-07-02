import type { Category } from './categories.ts';

/** The first category is the primary one (grouping, tinting). */
export const primaryCategory = (categories: readonly Category[]): Category =>
  categories[0] ?? 'other';
