const SWIPE_TRIGGER = 90; // px left-swipe that requests deletion

/** Has the block been swiped far enough left to ask for deletion? */
export const isDeleteSwipe = (offset: number): boolean => offset < -SWIPE_TRIGGER;
