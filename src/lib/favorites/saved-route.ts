// Per-user favourites and saved routes live in D1 (0007 migration). Favourites
// are a simple set of event ids; a saved route carries its computed itinerary as
// JSON so it reopens exactly as generated.

/** A saved route as the app reads it. */
export type SavedRoute = Readonly<{
  id: string;
  name: string;
  region: string;
  data: string;
  public: boolean;
  userId: string | undefined;
  createdAt: number;
}>;

// D1 returns SQL NULL for an anonymous route's user_id, and 0/1 for the boolean.
export type RouteRow = Readonly<{
  id: string;
  name: string;
  region: string;
  data: string;
  public: number;
  userId: string | undefined;
  createdAt: number;
}>;

/** What a caller hands over to persist a route. `userId` is undefined for an
 *  anonymous route, whose `editToken` is the author's device secret. */
export type RouteInput = Readonly<{
  id: string;
  userId: string | undefined;
  name: string;
  region: string;
  data: string;
  isPublic: boolean;
  editToken?: string;
}>;
