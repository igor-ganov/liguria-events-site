import { branch } from '../../lib/branch.ts';

export type RouteView = 'list' | 'timeline';

/** The view a toggle button asks for; anything but "timeline" is the list. */
export const toView = (value: unknown): RouteView =>
  branch(value === 'timeline')<RouteView>(() => 'timeline', () => 'list');
