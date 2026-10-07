import { feedIcons } from './feed-icons.ts';

/** Category → glyph reference, shipped as one JSON island so the feed script
 *  builds a late card with the same chips the server did. */
export const feedIconsJson = (): string => JSON.stringify(feedIcons());
