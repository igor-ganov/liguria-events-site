import { blockCentre } from './block-centre.ts';

/** The centres of every OTHER block on the axis — what a dragged block is
 *  ordered against. */
export const siblingCentres = (axis: HTMLElement, dragged: HTMLElement): readonly number[] =>
  [...axis.querySelectorAll<HTMLElement>('.tl-block')]
    .filter((block) => block !== dragged)
    .map(blockCentre);
