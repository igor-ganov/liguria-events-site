/**
 * The Android app's closed test, and whether it is still recruiting.
 *
 * Google will not let a personal developer account publish to production until
 * twelve testers have been opted in for fourteen unbroken days, so the ask has
 * to go where readers already are rather than into a mailing list nobody is on.
 *
 * One constant, so switching the call off the day the fourteen days are served
 * is a single edit rather than a hunt through templates.
 */
export const TESTER_CALL = {
  open: true,
  /** Joining the group is what makes somebody a tester; Play reads its roster. */
  group: 'https://groups.google.com/g/dovego-testers',
  /** Opting in is a second, separate step, and it only works once in the group. */
  optIn: 'https://play.google.com/apps/testing/it.dovego.twa',
} as const;
