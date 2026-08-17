import type { AcceptedUpload } from './accepted-upload.ts';

/** Store the original in R2 under a /uploads/ path served by this zone, so
 *  Cloudflare Transformations can resize it on the fly (see resized.ts).
 *  Answers with the stable /uploads/<key> URL. */
export const storeUpload = async (bucket: R2Bucket, upload: AcceptedUpload): Promise<Response> => {
  const key = `ev/${crypto.randomUUID().replace(/-/g, '')}.${upload.ext}`;
  await bucket.put(key, await upload.file.arrayBuffer(), {
    httpMetadata: { contentType: upload.file.type, cacheControl: 'public, max-age=31536000, immutable' },
  });
  return Response.json({ ok: true, url: `/uploads/${key}` });
};
