import { asNumberMap } from './as-number-map.ts';
import { generate } from './generate.ts';
import { GEN_KEYS } from './gen-keys.ts';
import { readJsonStore } from './read-json-store.ts';
import { writeJsonStore } from './write-json-store.ts';

const MIN_DUR = 15;

/** Shell: a typed per-stop duration. Written straight to the store and the
 *  route regenerated, so the change survives and the day reflows around it. */
export const setGenDuration = (input: HTMLInputElement): void => {
  const minutes = Math.max(MIN_DUR, Math.round(Number(input.value) || 0));
  const stored = asNumberMap(readJsonStore(GEN_KEYS.durations));
  writeJsonStore(GEN_KEYS.durations, { ...stored, [input.dataset['durId'] ?? '']: minutes });
  void generate();
};
