import { CATEGORIES } from './categories.ts';
import type { Category } from './categories.ts';

/**
 * Coerce an untrusted string — a `data-cat` attribute read back off the DOM —
 * into a known category, falling back to 'other'. Matching against the list
 * rather than casting means an unknown or absent value can never leak through.
 */
export const toCategory = (value: string | undefined): Category =>
  CATEGORIES.find((category) => category === value) ?? 'other';
