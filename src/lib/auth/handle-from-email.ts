/** A default @handle for a new account: the email's local part, letters and
 *  digits only, at most 20 characters — 'user' when nothing survives. */
export const handleFromEmail = (email: string): string => {
  const local = email.split('@')[0] ?? '';
  const base = local.replace(/[^a-z0-9]+/gi, '').toLowerCase().slice(0, 20);
  return [base].filter((candidate) => candidate.length > 0).at(0) ?? 'user';
};
