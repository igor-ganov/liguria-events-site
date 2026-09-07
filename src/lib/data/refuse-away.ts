/**
 * Refuse a shard the site could not be asked for, rather than reading it as a
 * region with nothing in it.
 *
 * A shard that was never built answers 404, and empty is the truthful reading
 * of that. With no connection the worker answers 504 for a file it does not
 * hold — and a caller that treats the two alike tells a reader in a tunnel
 * that Liguria has no landmarks.
 */
export const refuseAway = (status: number): void => {
  [status]
    .filter((code) => code >= 500)
    .forEach((code) => {
      throw new Error(`shard unreachable: ${code}`);
    });
};
