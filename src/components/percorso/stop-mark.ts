import { stopTransform } from './stop-transform.ts';

/** A circle that stops just short of closing — the same rule as the buttons. */
const CIRCLE =
  'M7.3,1.7 C10.4,1.8 12.4,4.2 12.3,7.1 C12.2,10.2 9.9,12.4 7,12.3 C3.9,12.2 1.7,9.9 1.8,7 C1.9,4.1 4.2,1.9 7.9,2';

export type Mark = Readonly<{ className: string; transform: string; d: string }>;

/** A stop on the thread, at the height of the card it belongs to. */
export const stopMark = (y: number, madeHere: boolean): Mark => ({
  className: `percorso__nodo${['', ' percorso__nodo--nostra'][Number(madeHere)] ?? ''}`,
  transform: stopTransform(y),
  d: CIRCLE,
});
