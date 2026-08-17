/** The values an event form starts with: every field a string (or a flag), so
 *  the markup can bind them straight to inputs without per-field defaulting. */
export type Prefill = Readonly<{
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  venue: string;
  categories: readonly string[];
  free: boolean;
  coverImage: string;
  address: string;
  phone: string;
  website: string;
  lat: string;
  lng: string;
}>;

/** A blank form — what "create" starts from. */
export const EMPTY_PREFILL: Prefill = {
  title: '', description: '', startDate: '', endDate: '', venue: '', categories: [],
  free: false, coverImage: '', address: '', phone: '', website: '', lat: '', lng: '',
};
