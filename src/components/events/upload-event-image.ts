import { jsonField } from '../../lib/json-field.ts';

/** What /api/events/image answered: the stored URL, or why it refused. */
export type ImageUpload = {
  readonly ok: boolean;
  readonly url: string | undefined;
  readonly detail: string | undefined;
};

/** Send the chosen file to R2 via our endpoint. A malformed body reads as an
 *  empty answer, which the caller reports like any other refusal. */
export const uploadEventImage = async (file: File): Promise<ImageUpload> => {
  const body = new FormData();
  body.append('file', file);
  const res = await fetch('/api/events/image', { method: 'POST', body });
  const data: unknown = await res.json().catch(() => ({}));
  return { ok: res.ok, url: jsonField(data, 'url'), detail: jsonField(data, 'detail') };
};
