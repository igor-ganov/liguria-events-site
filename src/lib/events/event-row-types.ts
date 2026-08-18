// D1 event rows as the driver hands them over. `| null` throughout is the
// database's own empty marker, returned verbatim by the D1 driver.
import type { Session } from './event-schema.ts';

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
};

/** The contact block, absent field by absent field. */
export type EventContacts = { address?: string; phone?: string; website?: string };

export type ContactRow = {
  address: string | null;
  phone: string | null;
  website: string | null;
};

export type DetailRow = EventRow & ContactRow & { status: string; submitter_id: string | null };

export type EditableRow = ContactRow & {
  title_en: string | null;
  desc_en: string | null;
  start_date: string;
  end_date: string | null;
  venue: string | null;
  categories: string | null;
  free: number;
  cover_image: string | null;
  lat: number | null;
  lng: number | null;
  sessions: string | null;
  kind: string | null;
  submitter_id: string | null;
};

export type EventFormValues = {
  title: string; description: string; startDate: string; endDate: string; venue: string;
  categories: string[]; free: boolean; coverImage: string; address: string; phone: string;
  website: string; lat: string; lng: string; container: boolean; sessions: readonly Session[];
};
