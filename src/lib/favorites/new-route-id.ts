/** A short, unguessable id for a newly saved route. */
export const newRouteId = (): string => `r${crypto.randomUUID().replace(/-/g, '').slice(0, 11)}`;
