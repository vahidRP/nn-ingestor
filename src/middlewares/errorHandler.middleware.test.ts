import { createMockRequest, createMockResponse } from '#tests/mocks.js';
import { describe, expect, it, vi } from 'vitest';
import z from 'zod';

vi.mock('#infra/logger.js', () => ({
  logger: {
    error: vi.fn(),
  },
}));

import { logger } from '#infra/logger.js';

import errorHandlerMiddleware from './errorHandler.middleware.js';

describe('errorHandler.middleware', () => {
  it('returns 400 with zod error details', () => {
    const schema = z.object({ name: z.string() });
    let error: z.ZodError;

    try {
      schema.parse({});
    } catch (err) {
      error = err as z.ZodError;
    }

    const req = createMockRequest();
    const res = createMockResponse();
    const next = vi.fn();

    errorHandlerMiddleware(error!, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(z.treeifyError(error!));
  });

  it('returns provided status and message for generic errors', () => {
    const error = Object.assign(new Error('Not Found'), { status: '404' });
    const req = createMockRequest();
    const res = createMockResponse();
    const next = vi.fn();

    errorHandlerMiddleware(error, req, res, next);

    expect(logger.error).toHaveBeenCalledWith(error);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not Found' });
  });
});
