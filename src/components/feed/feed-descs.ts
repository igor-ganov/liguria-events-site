/** What has been written about each event, by id: what the search matches
 *  beyond a card's own words. Empty until the region's file is fetched (see
 *  loadFeedDescs), and added to when the database brings a late event. */
export const feedDescs = new Map<string, string>();
