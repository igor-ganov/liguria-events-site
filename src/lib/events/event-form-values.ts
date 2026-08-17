import type { EditableRow, EventFormValues } from './event-row-types.ts';
import { numberText } from './number-text.ts';
import { parseCategories } from './parse-categories.ts';

/** An event row as the values the edit form is populated with — every field a
 *  string the input can hold, never an empty database marker. */
export const eventFormValues = (row: EditableRow): EventFormValues => ({
  title: row.title_en ?? '',
  description: row.desc_en ?? '',
  startDate: row.start_date,
  endDate: row.end_date ?? '',
  venue: row.venue ?? '',
  categories: [...parseCategories(row.categories)],
  free: row.free === 1,
  coverImage: row.cover_image ?? '',
  address: row.address ?? '',
  phone: row.phone ?? '',
  website: row.website ?? '',
  lat: numberText(row.lat),
  lng: numberText(row.lng),
});
