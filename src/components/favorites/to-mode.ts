import type { Mode } from '../../lib/favorites/build-route.ts';

const CHOOSABLE: readonly Mode[] = ['driving', 'transit'];

/** A travel mode read off a data attribute; anything else means walking. */
export const toMode = (value: unknown): Mode =>
  CHOOSABLE.find((mode) => mode === value) ?? 'walking';
