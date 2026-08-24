import { ADS } from './limits.ts';

/** Keep the assets that fit; drop the rest. Truncating an ad headline is how
 *  "Cosa fare a Reggio nell'Emilia" becomes "Cosa fare a Reggio nell'Emil…",
 *  which is worse than not saying it. */
export const fit = (limit: number) => (assets: readonly string[]): readonly string[] =>
  [...new Set(assets.map((asset) => asset.trim()))].filter(
    (asset) => asset.length > 0 && asset.length <= limit,
  );

export const fitHeadlines = fit(ADS.headlineMax);
export const fitDescriptions = fit(ADS.descriptionMax);
