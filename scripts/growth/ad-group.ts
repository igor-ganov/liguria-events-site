/** One ad group: the page it sends people to, what they typed to get there,
 *  and the assets Google assembles the ad from. */
export type AdGroup = Readonly<{
  name: string;
  url: string;
  keywords: readonly string[];
  headlines: readonly string[];
  descriptions: readonly string[];
}>;
