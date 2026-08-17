import { finiteNumber } from '../finite-number.ts';
import type { Point } from './point-types.ts';

// A 0-or-1 array: a label that is not a string contributes no key at all, so the
// optional property stays absent rather than becoming an empty string.
const labelOf = (raw: unknown): Readonly<{ label?: string }> =>
  [raw]
    .filter((candidate): candidate is string => typeof candidate === 'string')
    .map((label) => ({ label }))
    .at(0) ?? {};

/** Read a point off untrusted data (a stored value, a message payload). Both
 *  coordinates must be real numbers, or there is no point at all. */
export const asPoint = (value: unknown): Point | undefined => {
  const lat = finiteNumber(Reflect.get(Object(value), 'lat'));
  const lng = finiteNumber(Reflect.get(Object(value), 'lng'));
  return [{ lat, lng }]
    .filter((c): c is { lat: number; lng: number } => c.lat !== undefined && c.lng !== undefined)
    .map((c) => ({ ...c, ...labelOf(Reflect.get(Object(value), 'label')) }))
    .at(0);
};
