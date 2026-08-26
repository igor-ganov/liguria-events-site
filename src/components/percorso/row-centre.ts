/**
 * Where a stop belongs: level with the middle of its card, not at a fixed
 * offset from the top — cards are not all the same height, and a node that
 * ignores that drifts away from the event it marks.
 */
export const rowCentre = (row: HTMLElement): number => row.offsetTop + row.offsetHeight / 2;
