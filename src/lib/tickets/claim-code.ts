const DIGITS = 6;
const encoder = new TextEncoder();

/**
 * The code that proves a claim: six digits derived from the site's secret, the
 * thread, the address it is sent to and which sending this is. Nothing about it
 * is stored — whoever checks it derives it again — so a copy of the database
 * holds no code, and sending a new one makes the old one worthless.
 */
export const claimCode = async (secret: string, ticketId: string, address: string, send: number): Promise<string> => {
  const key = await crypto.subtle.importKey('raw', encoder.encode(`claim-code:${secret}`), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = await crypto.subtle.sign('HMAC', key, encoder.encode(`${ticketId}\n${address}\n${send}`));
  const number = new DataView(mac).getUint32(0) % 10 ** DIGITS;
  return String(number).padStart(DIGITS, '0');
};
