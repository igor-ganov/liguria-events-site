/** What is kept about the code sent for a claim: where it went, how many were
 *  sent, how many wrong guesses the current one has taken, who sent it and
 *  when it runs out. The code itself is not kept. */
export type ClaimCodeRow = Readonly<{ address: string; sends: number; tries: number; sentBy: string; expiresAt: string }>;
