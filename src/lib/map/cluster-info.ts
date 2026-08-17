/** What a supercluster query result says about itself: whether it stands for a
 *  group of points, which group, and how many. */
export type ClusterInfo = Readonly<{ cluster: boolean; clusterId: number; count: number }>;

/**
 * Read the cluster fields off a query result's properties. Supercluster types a
 * result as the UNION of the cluster properties and the layer's payload, so
 * these fields can only be reached through an untyped read — `Object(x)` boxes
 * primitives and yields `{}` for the nullish values, which keeps the three
 * reads cast-free and total.
 */
export const clusterInfo = (properties: unknown): ClusterInfo => ({
  cluster: Object(properties)['cluster'] === true,
  clusterId: Number(Object(properties)['cluster_id'] ?? 0),
  count: Number(Object(properties)['point_count'] ?? 0),
});
