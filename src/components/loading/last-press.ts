import type { Press } from '../../lib/loading/press.ts';

/** The control pressed last on this page; written by watchPresses. */
export const lastPress: { current: Press<Element> | undefined } = { current: undefined };
