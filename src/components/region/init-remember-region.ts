import { regionInPath } from '../../lib/region/region-in-path.ts';
import { writeRegion } from '../../lib/region/write-region.ts';

const remember = (): void => {
  [regionInPath(window.location.pathname)]
    .filter((slug): slug is string => slug !== undefined)
    .forEach(writeRegion);
};

/**
 * Remember the region of every page the reader opens.
 *
 * Nothing was remembered before, which is why the front door guessed: a reader
 * who had chosen a region yesterday and a reader who had never been here were
 * handed the same answer. The address of the page they are on is the plainest
 * record of where they read, and it is kept in their browser, where a setting
 * of theirs belongs.
 */
export const initRememberRegion = (): void => {
  remember();
  document.addEventListener('astro:page-load', remember);
};
