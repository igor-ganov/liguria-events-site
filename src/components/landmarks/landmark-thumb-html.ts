import { branch } from '../../lib/branch.ts';
import { commonsImg } from '../../lib/img/commons-img.ts';
import { escapeMarkup } from '../../lib/escape-markup.ts';
import { landmarkIcon } from '../../lib/landmarks/landmark-icon.ts';
import type { Landmark } from '../../lib/landmarks/landmark-schema.ts';

/** A landmark's photo, or its kind icon when Commons has none. */
export const landmarkThumbHtml = (landmark: Landmark): string =>
  branch((landmark.img ?? '') === '')(
    () => `<span class="lm-thumb-icon" aria-hidden="true">${landmarkIcon(landmark.kind, 30)}</span>`,
    () =>
      `<img class="lm-thumb-img" src="${escapeMarkup(commonsImg(landmark.img ?? '', 400))}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" />`,
  );
