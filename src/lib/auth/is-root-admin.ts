/** Whether an email is one of the env-granted root admins (case/space blind). */
export const isRootAdmin = (email: string, admins: readonly string[]): boolean =>
  admins.includes(email.trim().toLowerCase());
