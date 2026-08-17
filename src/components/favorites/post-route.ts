import { asSavedRoute } from './as-saved-route.ts';
import type { SavedRoute } from './as-saved-route.ts';

/** Shell: save a generated route to the API. Offline, or a rejected save,
 *  yields nothing — the caller still keeps a local copy. */
export const postRoute = async (name: string, data: string): Promise<readonly SavedRoute[]> => {
  try {
    const res = await fetch('/api/routes', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name, data }),
    });
    const body: unknown = await [res].filter((response) => response.ok).at(0)?.json();
    return asSavedRoute(body);
  } catch {
    return [];
  }
};
