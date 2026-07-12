import { REGION_NAMES } from './regions.ts';

export const regionName = (slug: string): string => REGION_NAMES[slug] ?? slug;
