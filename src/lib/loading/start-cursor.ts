/** Where a session starts in the list, so two visits open on different tips. */
export const startCursor = (random: () => number, count: number): number =>
  Math.floor(random() * Math.max(count, 0));
