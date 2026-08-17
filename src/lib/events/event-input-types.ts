// The event form payload at its three stages: raw strings off the request, the
// first validation verdict, and the values bound to SQL.

/** The submitted fields, trimmed and bounded, before any rule is applied. */
export type EventDraft = Readonly<{
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  venue: string;
  address: string;
  phone: string;
  website: string;
  cover: string;
  lat: string;
  lng: string;
  categories: readonly string[];
  free: boolean;
}>;

/** The validated, normalized payload. The empty values are the database's own
 *  empty marker, which the D1 driver requires verbatim. */
export type EventInput = {
  title: string;
  description: string;
  startDate: string;
  endDate: string | null;
  venue: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  cover: string | null;
  lat: number | null;
  lng: number | null;
  categoriesJson: string;
  free: 0 | 1;
};

export type EventInputResult =
  | { ok: true; value: EventInput }
  | { ok: false; detail: string };
