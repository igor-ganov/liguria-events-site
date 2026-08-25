// D1 event rows as the driver hands them over. `| null` throughout is the
// database's own empty marker, returned verbatim by the D1 driver.

export type EventRow = {
  id: string;
  title_en: string | null;
  title_it: string | null;
  title_ru: string | null;
  desc_en: string | null;
  desc_it: string | null;
  desc_ru: string | null;
  start_date: string;
  end_date: string | null;
  categories: string | null;
  venue: string | null;
  lat: number | null;
  lng: number | null;
  cover_image: string | null;
  free: number;
  gem: number;
  /** The programme as stored JSON — a container's dated occurrences. */
  sessions: string | null;
  /** 'container' when the event happens only on those dates. */
  kind: string | null;
  /** 'user' for an event made here, 'crawler' for one that was found. */
  origin: string | null;
};

/** The contact block, absent field by absent field. */
export type EventContacts = { address?: string; phone?: string; website?: string };

export type ContactRow = {
  address: string | null;
  phone: string | null;
  website: string | null;
};
