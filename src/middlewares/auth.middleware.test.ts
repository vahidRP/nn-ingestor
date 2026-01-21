import { createMockAuthRequest, createMockResponse } from '#tests/mocks.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('jsonwebtoken', () => ({
  default: {
    verify: vi.fn(),
  },
}));

import jwt from 'jsonwebtoken';

import { authMiddleware } from './auth.middleware.js';

describe('auth.middleware', () => {
  const mockJwt = vi.mocked(jwt);
  const verifyMock = mockJwt.verify as unknown as ReturnType<typeof vi.fn>;
  let originalJwtSecret: string | undefined;

  beforeEach(() => {
    originalJwtSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = 'test-secret';
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env.JWT_SECRET = originalJwtSecret;
  });

  it('returns 401 when no bearer token is provided', () => {
    const req = createMockAuthRequest({ headers: {} });
    const res = createMockResponse();
    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when token verification fails', () => {
    const req = createMockAuthRequest({
      headers: { authorization: 'Bearer bad-token' },
    });
    const res = createMockResponse();
    const next = vi.fn();

    mockJwt.verify.mockImplementationOnce(() => {
      throw new Error('bad token');
    });

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('sets req.user and calls next for a valid token', () => {
    const req = createMockAuthRequest({
      headers: { authorization: 'Bearer good-token' },
    });
    const res = createMockResponse();
    const next = vi.fn();

    verifyMock.mockReturnValueOnce({
      email: 'user@example.com',
      id: 1,
      name: 'user',
      role: 'user',
    });

    authMiddleware(req, res, next);

    expect(req.user).toEqual({
      email: 'user@example.com',
      id: 1,
      name: 'user',
      role: 'user',
    });
    expect(next).toHaveBeenCalled();
  });
});
