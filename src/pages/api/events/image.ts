import type { APIRoute } from 'astro';
import { acceptedUpload } from '../../../lib/img/accepted-upload.ts';
import { gatedResponse } from '../../../lib/gated-response.ts';
import { isUnbanned } from '../../../lib/auth/is-unbanned.ts';
import { storeUpload } from '../../../lib/img/store-upload.ts';
import { uploadProblem } from '../../../lib/img/upload-problem.ts';

export const prerender = false;

const unauthorized = () => Response.json({ error: 'unauthorized' }, { status: 401 });
const banned = () => Response.json({ error: 'banned' }, { status: 403 });

/** A signed-in user uploads one event image. A 0-or-1 upload: anything the image
 *  checks object to is a 400 carrying the reason, and nothing is stored. */
export const POST: APIRoute = ({ request, locals }) =>
  gatedResponse(locals.user)(unauthorized)((user) =>
    gatedResponse(user, isUnbanned)(banned)(async () => {
      const form = await request.formData().catch(() => undefined);
      const candidate = form?.get('file');
      const stored = await Promise.all(
        acceptedUpload(candidate).map((upload) => storeUpload(locals.runtime.env.UPLOADS, upload)),
      );
      return stored.at(0) ?? Response.json({ error: 'invalid', detail: uploadProblem(candidate) }, { status: 400 });
    }),
  );
