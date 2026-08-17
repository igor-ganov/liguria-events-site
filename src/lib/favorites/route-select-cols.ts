/** The saved_routes projection every read shares — aliased to the RouteRow
 *  field names so the row needs no renaming pass. */
export const ROUTE_SELECT_COLS = `id, user_id AS userId, name, region, data, public, created_at AS createdAt`;
