/** How far a swipe has pulled the block: leftwards only, so a rightward drag
 *  cannot push it off its lane. */
export const swipeOffset = (dx: number): number => Math.min(0, dx);
