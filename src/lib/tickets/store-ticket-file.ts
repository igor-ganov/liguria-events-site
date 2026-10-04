import type { AcceptedUpload } from '../img/accepted-upload.ts';

/** Keep a screenshot attached to a message, under its own prefix so requests
 *  and event covers can be told apart in the bucket. Answers with its address. */
export const storeTicketFile = async (bucket: R2Bucket, upload: AcceptedUpload): Promise<string> => {
  const key = `tk/${crypto.randomUUID().replace(/-/g, '')}.${upload.ext}`;
  await bucket.put(key, await upload.file.arrayBuffer(), {
    httpMetadata: { contentType: upload.file.type, cacheControl: 'private, max-age=31536000, immutable' },
  });
  return `/uploads/${key}`;
};
