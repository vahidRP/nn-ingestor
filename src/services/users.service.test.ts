import { hashStringToNumber } from '#utils/string.js';
import { describe, expect, it } from 'vitest';

import { findUserByEmail } from './users.service.js';

describe('users.service', () => {
  it('returns a user payload derived from the email', () => {
    const email = 'alice@example.com';

    const user = findUserByEmail(email);

    expect(user).toEqual({
      email,
      id: hashStringToNumber(email),
      name: 'alice',
      role: 'user',
    });
  });
});
