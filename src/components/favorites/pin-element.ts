import { basePinEl } from './base-pin-el.ts';
import { stopPinEl } from './stop-pin-el.ts';
import type { MarkerSpec, PinKind } from './map-types.ts';

const PIN: Readonly<Record<PinKind, (spec: MarkerSpec) => HTMLElement>> = {
  stop: (spec) => stopPinEl(spec.n, spec.tight),
  base: () => basePinEl(false),
  final: () => basePinEl(true),
};

/** The DOM element a marker spec is drawn with. */
export const pinElement = (spec: MarkerSpec): HTMLElement => PIN[spec.kind](spec);
