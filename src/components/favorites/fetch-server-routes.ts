import { asServerRoutes } from './as-server-routes.ts';
import { fieldOf } from './field-of.ts';
import type { MyRoute } from './my-route-types.ts';

/** Shell: the account's stored routes. An anonymous visitor (or an unreachable
 *  API) simply has none. */
export const fetchServerRoutes = async (): Promise<readonly MyRoute[]> => {
  try {
    const res = await fetch('/api/routes', { headers: { accept: 'application/json' } });
    const bodies = await Promise.all([res].filter((r) => r.ok).map((r): Promise<unknown> => r.json()));
    return asServerRoutes(fieldOf(bodies.at(0), 'routes'));
  } catch {
    return [];
  }
};
