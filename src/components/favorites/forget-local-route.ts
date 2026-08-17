import { asArray } from './as-array.ts';
import { fieldOf } from './field-of.ts';
import { readJsonStore } from './read-json-store.ts';
import { ROUTES_KEY } from './routes-key.ts';
import { writeJsonStore } from './write-json-store.ts';

/** Shell: drop one route from this device's remembered links. */
export const forgetLocalRoute = (id: string): void => {
  writeJsonStore(
    ROUTES_KEY,
    asArray(readJsonStore(ROUTES_KEY)).filter((row) => fieldOf(row, 'id') !== id),
  );
};
