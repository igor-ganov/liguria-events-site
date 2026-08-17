import type { Corner } from './corner.ts';

const CORNERS: Readonly<Record<string, Corner>> = {
  'top-left': 'top-left',
  'top-right': 'top-right',
  'bottom-left': 'bottom-left',
  'bottom-right': 'bottom-right',
};

/** The corner remembered in localStorage, falling back to bottom-right —
 *  the store can hold anything an older build (or a user) left there. */
export const cornerFrom = (value?: string): Corner => CORNERS[value ?? ''] ?? 'bottom-right';
