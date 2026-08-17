import { branch } from '../../lib/branch.ts';
import type { RegionPickerParts } from './region-picker-parts.ts';

/** Phone: a modal bottom sheet, so it sits in the top layer and the header's
 *  backdrop-filter cannot become its containing block. Desktop: a plain
 *  non-modal dropdown anchored under the button. */
const isPhone = (): boolean => window.matchMedia('(max-width: 44rem)').matches;

export type RegionPopup = {
  readonly open: () => void;
  readonly close: () => void;
  readonly flip: () => void;
  readonly isPhone: () => boolean;
};

/** The picker's open/close behaviour, bound to its elements. */
export const regionPopup = (parts: RegionPickerParts): RegionPopup => {
  const open = (): void => {
    branch(isPhone())(
      () => parts.pop.showModal(),
      () => parts.pop.show(),
    );
    parts.toggle.setAttribute('aria-expanded', 'true');
    parts.search.focus();
  };
  const close = (): void => {
    parts.pop.close();
    parts.toggle.setAttribute('aria-expanded', 'false');
  };
  return { open, close, flip: () => branch(parts.pop.open)(close, open), isPhone };
};
