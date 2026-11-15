/** The words the thread of an event page is written with, from the page's
 *  dictionary (eventPage). Templates carry {count}, {left} and {total}. */
export type ThreadLabels = Readonly<{
  today: string;
  oneDate: string;
  datesCount: string;
  left: string;
  more: string;
  free: string;
  from: string;
  priceUnknown: string;
}>;
