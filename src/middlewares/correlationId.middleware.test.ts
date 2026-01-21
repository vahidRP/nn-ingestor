import { createMockRequest, createMockResponse } from '#tests/mocks.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('crypto', () => ({
  randomUUID: vi.fn(() => 'corr-123'),
}));

import { randomUUID } from 'crypto';

import { correlationIdMiddleware } from './correlationId.middleware.js';

describe('correlationId.middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('adds a correlation id when missing', () => {
    const req = createMockRequest({ headers: {} });
    const res = createMockResponse();
    const next = vi.fn();

    correlationIdMiddleware(req, res, next);

    expect(req.headers['x-correlation-id']).toBe('corr-123');
    expect(randomUUID).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('preserves an existing correlation id', () => {
    const req = createMockRequest({ headers: { 'x-correlation-id': 'existing' } });
    const res = createMockResponse();
    const next = vi.fn();

    correlationIdMiddleware(req, res, next);

    expect(req.headers['x-correlation-id']).toBe('existing');
    expect(randomUUID).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});
