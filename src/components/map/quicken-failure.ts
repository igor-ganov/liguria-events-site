import type { MapLibreMap } from 'maplibre-gl';

/** How long the map gets to recover before the reader is told. One tile can
 *  fail on a perfectly good connection; a map with no network keeps failing. */
const GRACE_MS = 2000;

/**
 * Say it quickly when the map cannot draw at all.
 *
 * The page itself comes off the device instantly with no signal, and then sat
 * on a spinner for thirty seconds before admitting the map was not coming —
 * which is the difference between an app that knows where it is and one that
 * hangs. The first error is not proof, so it starts a short clock instead, and
 * a map that comes up inside it stops the clock.
 */
export const quickenFailure = (map: MapLibreMap, fail: () => void): (() => void) => {
  const pending = { id: 0 };
  map.on('error', () => {
    clearTimeout(pending.id);
    pending.id = window.setTimeout(fail, GRACE_MS);
  });
  return () => clearTimeout(pending.id);
};
