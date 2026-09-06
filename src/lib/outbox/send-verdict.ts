/** What to do with a submission the moment its send comes back. */
export type SendVerdict = 'sent' | 'queue' | 'refused';

// Read in order, first match wins. Absent means the request never reached the
// site at all — no signal, a captive portal, a tunnel that is up but dead —
// and that is the case this whole mechanism exists for.
const RETRYABLE = [429, 500, 502, 503, 504];

/**
 * Whether the author's work is safe, should wait, or was turned down.
 *
 * The distinction that matters is between "the site said no" and "the site
 * never heard". A refusal is information the author needs now; silence is not
 * their problem and must not cost them what they typed.
 */
export const sendVerdict = (status: number | undefined): SendVerdict =>
  [status]
    .filter((code) => code !== undefined)
    .map((code): SendVerdict => {
      const ok = code >= 200 && code < 300;
      const wait = RETRYABLE.includes(code);
      return [
        ...[ok].filter(Boolean).map((): SendVerdict => 'sent'),
        ...[wait].filter(Boolean).map((): SendVerdict => 'queue'),
      ].at(0) ?? 'refused';
    })
    .at(0) ?? 'queue';
