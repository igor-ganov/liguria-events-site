/** What Google Ads rejects an asset for, and the minimum a responsive search
 *  ad needs to run at all. Encoded rather than remembered: a headline one
 *  character over is refused at upload, after the whole file is built. */
export const ADS = {
  headlineMax: 30,
  descriptionMax: 90,
  headlinesNeeded: 3,
  descriptionsNeeded: 2,
  /** Do not buy traffic to a page with nothing on it. */
  minCityEvents: 5,
  minVenueEvents: 3,
};
