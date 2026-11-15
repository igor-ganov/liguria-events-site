const STEP: Readonly<Record<string, (count: number, current: number) => number>> = {
  ArrowDown: (count, current) => (current + 1) % count,
  ArrowUp: (count, current) => (Math.max(current, 0) - 1 + count) % count,
};

/**
 * The option an arrow key makes active, over both groups as one list. It
 * wraps at either end, and from no active option Down lands on the first and
 * Up on the last (WAI-ARIA APG, combobox with listbox popup). With no options
 * there is nothing to make active: -1.
 */
export const moveActive = (count: number, current: number, key: string): number =>
  Math.max(-1, Math.min(count - 1, (STEP[key] ?? ((_, at: number) => at))(Math.max(count, 1), current)));
