// The wider row shapes: what the detail route and the editor read, on top of
// the columns every event read selects.
import type { Session } from './event-schema.ts';
import type { ContactRow, EventRow } from './event-row-types.ts';

export type DetailRow = EventRow & ContactRow & {
  status: string;
  visibility: string;
  submitter_id: string | null;
};

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
