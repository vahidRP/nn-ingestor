import { DBUser } from '#types/auth.js';
import { hashStringToNumber } from '#utils/string.js';

export const findUserByEmail = (email: string): DBUser | null => {
  // TODO: Implement user lookup by email

  const name = email.split('@')[0];

  return { email, id: hashStringToNumber(email), name, role: 'user' };
};
