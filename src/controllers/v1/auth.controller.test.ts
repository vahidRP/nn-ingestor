import { createMockAuthRequest, createMockRequest, createMockResponse } from '#tests/mocks.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('#services/users.service.js', () => ({
  findUserByEmail: vi.fn(),
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(),
  },
}));

import { findUserByEmail } from '#services/users.service.js';
import jwt from 'jsonwebtoken';

import { getMe, postLogin } from './auth.controller.js';

describe('auth.controller', () => {
  const mockFindUserByEmail = vi.mocked(findUserByEmail);
  const mockJwt = vi.mocked(jwt);
  const signMock = mockJwt.sign as unknown as ReturnType<typeof vi.fn>;
  let originalJwtSecret: string | undefined;

  beforeEach(() => {
    originalJwtSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = 'test-secret';
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env.JWT_SECRET = originalJwtSecret;
  });

  it('returns 401 when credentials are invalid', () => {
    const req = createMockRequest({
      body: { email: 'missing@example.com', password: 'password' },
    });
    const res = createMockResponse();

    mockFindUserByEmail.mockReturnValueOnce(null);

    postLogin(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
  });

  it('returns a token when credentials are valid', () => {
    const req = createMockRequest({
      body: { email: 'user@example.com', password: 'password' },
    });
    const res = createMockResponse();

    mockFindUserByEmail.mockReturnValueOnce({
      email: 'user@example.com',
      id: 123,
      name: 'user',
      role: 'user',
    });
    signMock.mockReturnValueOnce('token-123');

    postLogin(req, res, vi.fn());

    expect(mockJwt.sign).toHaveBeenCalledWith(
      {
        email: 'user@example.com',
        id: 123,
        name: 'user',
        role: 'user',
      },
      'test-secret',
      { expiresIn: '1h' }
    );
    expect(res.json).toHaveBeenCalledWith({ token: 'token-123' });
  });

  it('returns the authenticated user for getMe', () => {
    const req = createMockAuthRequest({
      user: { email: 'user@example.com', id: 1, name: 'user', role: 'user' },
    });
    const res = createMockResponse();

    getMe(req, res, vi.fn());

    expect(res.json).toHaveBeenCalledWith({
      email: 'user@example.com',
      id: 1,
      name: 'user',
      role: 'user',
    });
  });
});
