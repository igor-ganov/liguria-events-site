/**
 * The source item a supercluster point feature carries. A viewport query hands
 * back the UNION of cluster properties and payload, so the payload is reachable
 * only through an untyped read: `Object(x)` returns the very same object at
 * runtime and keeps that read free of a cast, exactly as the style transforms
 * in this folder do.
 */
export const pointPayload = <T>(properties: unknown): T => Object(properties)['item'];
