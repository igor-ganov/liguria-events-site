/**
 * What a map layer hangs on each of its supercluster point features: the whole
 * source item, under one fixed key. A plain object-literal alias on purpose —
 * supercluster constrains its properties type to GeoJSON's index-signature
 * shape, which only such an alias satisfies implicitly.
 */
export type Payload<T> = { item: T };
