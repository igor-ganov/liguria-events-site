import type { UiIconName } from '../icons/ui-icon-paths.ts';

/** One fact about an event, said as a number: the glyph, the figure, and the
 *  word under it that says what the figure is. */
export type EventTile = Readonly<{ key: string; icon: UiIconName; value: string; label: string }>;
