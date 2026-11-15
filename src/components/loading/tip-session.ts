/** The tip shared by every load in progress: how many there are, since when
 *  the first one runs, and the timers that show and rotate the tip. */
export const tipSession = {
  active: 0,
  since: 0,
  due: 0,
  rotate: 0,
};
