import { createMockRequest, createMockResponse } from '#tests/mocks.js';
import { describe, expect, it, vi } from 'vitest';

vi.mock('#infra/requestContext.js', () => ({
  requestContext: {
    run: vi.fn(),
  },
}));

import { requestContext } from '#infra/requestContext.js';

import { requestLoggerMiddleware } from './requestLogger.middleware.js';

describe('requestLogger.middleware', () => {
  it('runs request context with correlation id, method, and path', () => {
    const req = createMockRequest({
      header: vi.fn().mockReturnValue('corr-789'),
      method: 'GET',
      path: '/health',
    });
    const res = createMockResponse();
    const next = vi.fn();

    requestLoggerMiddleware(req, res, next);

    expect(requestContext.run).toHaveBeenCalledWith(
      {
        correlationId: 'corr-789',
        method: 'GET',
        path: '/health',
      },
      next
    );
  });

  it('falls back to placeholder when correlation id is missing', () => {
    const req = createMockRequest({
      header: vi.fn().mockReturnValue(undefined),
      method: 'POST',
      path: '/api/v1/events',
    });
    const res = createMockResponse();
    const next = vi.fn();

    requestLoggerMiddleware(req, res, next);

    expect(requestContext.run).toHaveBeenCalledWith(
      {
        correlationId: '<no-correlation-id>',
        method: 'POST',
        path: '/api/v1/events',
      },
      next
    );
  });
});
