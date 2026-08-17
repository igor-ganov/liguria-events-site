/**
 * The origin of the basemap host (e.g. tiles.dovego.it). Preconnecting to it on
 * map pages saves the DNS+TLS round-trip before the many pmtiles range requests
 * — a real win on a throttled connection. Undefined when the tiles are
 * same-origin (no PUBLIC_PMTILES_URL), where a preconnect would be pointless.
 */
export const tilesOrigin = (url: string | undefined): string | undefined => {
  try {
    return new URL(url ?? '').origin;
  } catch {
    return undefined;
  }
};
