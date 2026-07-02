import { branch } from '../../lib/branch.ts';
import type { Category } from '../../lib/events/categories.ts';

/** Immutable toggle: present → remove, absent → append (AC-3.2). */
export const toggleCategory = (
  selected: readonly Category[],
  category: Category,
): readonly Category[] =>
  branch(selected.includes(category))(
    () => selected.filter((existing) => existing !== category),
    () => [...selected, category],
  );
