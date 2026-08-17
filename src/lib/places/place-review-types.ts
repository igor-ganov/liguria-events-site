// User reviews on a place. Places aren't rows in the DB — they live in the
// static shards — so everything keys on the place's open-data id. See the
// 0005_place_reviews migration.
//
// `comment` keeps the database's own empty marker: the column is nullable and
// the D1 driver returns it verbatim, so the shape has to admit it.

export type PlaceReview = Readonly<{ handle: string; rating: number; comment: string | null; createdAt: string }>;
export type ReviewSummary = Readonly<{ avg: number; count: number }>;
export type MyReview = Readonly<{ rating: number; comment: string | null }>;
