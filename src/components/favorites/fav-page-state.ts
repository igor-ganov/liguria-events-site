/** The favourites page's only mutable bit: whether its `favchange` listener is
 *  already attached, so a re-init never doubles the repaints. */
export const favPageState: { listening: boolean } = { listening: false };
