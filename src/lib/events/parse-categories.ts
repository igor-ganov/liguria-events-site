import { stringList } from '../string-list.ts';

/** The categories stored as a JSON array on the row. Malformed JSON — or JSON
 *  that is not an array of strings — reads as none. */
export const parseCategories = (raw: string | null): readonly string[] => {
  try {
    return stringList(JSON.parse(raw ?? '[]'));
  } catch {
    return [];
  }
};
