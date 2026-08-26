/** The length of one bend. The phase is keyed to the column, not the screen,
 *  so the wobble travels with the content instead of shimmering in place. */
const STRETCH = 120;
const LANE = 9;
const SWAY = 3.4;

const swayAt = (index: number): number => [SWAY, -SWAY][((index % 2) + 2) % 2] ?? SWAY;

const bend = (index: number, shift: number): string => {
  const middle = index * STRETCH + STRETCH / 2 + shift;
  const end = (index + 1) * STRETCH + shift;
  return `C${LANE + swayAt(index)},${middle} ${LANE - swayAt(index)},${middle} ${LANE},${end}`;
};

type Window = Readonly<{ from: number; to: number; shift: number }>;

/**
 * The stretch of thread worth drawing: from the top of what is on screen down
 * to the reading line, given in screen coordinates by `shift`. Only this much
 * is ever handed to the browser — a path spanning a forty-thousand-pixel feed
 * is past what an SVG places accurately, and the stops drift off their cards.
 */
export const threadWindow = ({ from, to, shift }: Window): string => {
  const first = Math.floor(from / STRETCH);
  const last = Math.ceil(to / STRETCH);
  const steps = Array.from({ length: Math.max(1, last - first) }, (_unused, step) =>
    bend(first + step, shift),
  );
  return `M${LANE},${first * STRETCH + shift} ${steps.join(' ')}`;
};
