import { isDefined } from '../../lib/is-defined.ts';
import { setText } from '../../lib/dom/set-text.ts';
import { uploadEventImage } from './upload-event-image.ts';
import { uploadedImageUrl } from './uploaded-image-url.ts';
import type { ImageUpload } from './upload-event-image.ts';

// The preview is served through Cloudflare Transformations, not stored resized.
const PREVIEW = '/cdn-cgi/image/width=480,format=auto,quality=82';

type ImageParts = {
  readonly input: HTMLInputElement;
  readonly cover: HTMLInputElement;
  readonly preview: HTMLImageElement | undefined;
  readonly status: HTMLElement | undefined;
};

const accept = (parts: ImageParts, url: string): void => {
  parts.cover.value = url;
  [parts.preview].filter(isDefined).forEach((img) => {
    img.src = `${PREVIEW}${url}`;
    img.hidden = false;
  });
  setText(parts.status, '✓ Uploaded');
};

const settle = (parts: ImageParts, upload: ImageUpload): void => {
  const urls = [uploadedImageUrl(upload.ok, upload.url)].filter(isDefined);
  urls.forEach((url) => accept(parts, url));
  [urls.length]
    .filter((count) => count === 0)
    .forEach(() => setText(parts.status, upload.detail ?? 'Upload failed.'));
};

const send = async (parts: ImageParts, file: File): Promise<void> => {
  setText(parts.status, 'Uploading…');
  settle(parts, await uploadEventImage(file));
};

// A change event with no file (the picker was cancelled) uploads nothing.
const pick = async (parts: ImageParts): Promise<void> => {
  await Promise.all([parts.input.files?.[0]].filter(isDefined).map((file) => send(parts, file)));
};

/** Upload the chosen image to R2 as soon as it is picked, so the form submits a
 *  URL rather than bytes. */
export const wireImageUpload = (form: HTMLFormElement): void => {
  const input = form.querySelector<HTMLInputElement>('[data-image-input]') ?? undefined;
  const cover = form.querySelector<HTMLInputElement>('[data-cover]') ?? undefined;
  const preview = form.querySelector<HTMLImageElement>('[data-image-preview]') ?? undefined;
  const status = form.querySelector<HTMLElement>('[data-image-status]') ?? undefined;
  [input].filter(isDefined).forEach((field) =>
    [cover].filter(isDefined).forEach((target) => {
      const parts: ImageParts = { input: field, cover: target, preview, status };
      field.addEventListener('change', () => void pick(parts));
    }),
  );
};
