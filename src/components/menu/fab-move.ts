/** What the floating menu button does after a scroll. */
export type FabMove = 'away' | 'back' | 'stay';

// Near the top the page has not started yet; at the end its foot leaves room
// for the button. In between, moving down means reading.
const TOP = 64;
const END = 4;

/**
 * Where the menu button goes as a long page is read: out of the way while the
 * reader moves down through the words, back as soon as they scroll up — which
 * is how a reader looks for a way off the page — and at the top and the end.
 */
export const fabMove = ({ previous, current, room }: Readonly<{ previous: number; current: number; room: number }>): FabMove =>
  [
    { when: current <= TOP || room <= END, move: 'back' as const },
    { when: current > previous, move: 'away' as const },
    { when: current < previous, move: 'back' as const },
  ].find((rule) => rule.when)?.move ?? 'stay';
