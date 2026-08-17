import { branch } from '../branch.ts';
import type { RouteInput } from './saved-route.ts';

/** A statement ready to run: the SQL and its positional bindings. */
export type RouteInsert = Readonly<{ sql: string; values: readonly (string | number)[] }>;

const ON_CONFLICT = `ON CONFLICT(id) DO UPDATE SET name = excluded.name, data = excluded.data, public = excluded.public`;

// Omit user_id for an anonymous route so SQLite stores SQL NULL (D1 .bind() has
// no undefined; omitting the column is the clean way to get a NULL owner). Its
// edit_token is the author's device's secret key for later edits.
const ANONYMOUS = `INSERT INTO saved_routes (id, name, region, data, public, created_at, edit_token) VALUES (?, ?, ?, ?, ?, ?, ?) ${ON_CONFLICT}`;

const OWNED = `INSERT INTO saved_routes (id, user_id, name, region, data, public, created_at) VALUES (?, ?, ?, ?, ?, ?, ?) ${ON_CONFLICT}`;

/** Choose the upsert for a route: owner-less rows take the token-carrying
 *  statement, owned rows the one that stores the owner. */
export const routeInsert = (route: RouteInput, now: number): RouteInsert => {
  const pub = Number(route.isPublic);
  return branch(route.userId === undefined)<RouteInsert>(
    () => ({
      sql: ANONYMOUS,
      values: [route.id, route.name, route.region, route.data, pub, now, route.editToken ?? ''],
    }),
    () => ({
      sql: OWNED,
      values: [route.id, route.userId ?? '', route.name, route.region, route.data, pub, now],
    }),
  );
};
