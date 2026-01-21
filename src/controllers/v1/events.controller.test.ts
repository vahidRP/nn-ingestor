import { createMockAuthRequest, createMockResponse } from '#tests/mocks.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('#services/events.service.js', () => ({
  process: vi.fn(),
}));

vi.mock('#infra/logger.js', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

import { logger } from '#infra/logger.js';
import { process as processEvents } from '#services/events.service.js';

import { postEvents } from './events.controller.js';

describe('events.controller', () => {
  const mockProcessEvents = vi.mocked(processEvents);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws on invalid event payload and logs a warning', () => {
    const req = createMockAuthRequest({
      body: { eventType: 'invalid', timestamp: '2025-01-01T00:00:00Z' },
    });
    const res = createMockResponse();

    expect(() => postEvents(req, res, vi.fn())).toThrow();
    expect(logger.warn).toHaveBeenCalledOnce();
  });

  it('accepts valid events and processes with user id', () => {
    const req = createMockAuthRequest({
      body: { eventType: 'page_view', timestamp: '2025-01-01T00:00:00Z' },
      user: { email: 'user@example.com', id: 42, name: 'user', role: 'user' },
    });
    const res = createMockResponse();

    postEvents(req, res, vi.fn());

    expect(mockProcessEvents).toHaveBeenCalledWith(
      [
        {
          eventType: 'page_view',
          timestamp: new Date('2025-01-01T00:00:00Z'),
        },
      ],
      { userId: 42 }
    );
    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.json).toHaveBeenCalledWith({ status: 'accepted' });
    expect(logger.info).toHaveBeenCalledWith('Events processed successfully');
  });

  it('returns 500 when processing throws synchronously', () => {
    const req = createMockAuthRequest({
      body: { eventType: 'page_view', timestamp: '2025-01-01T00:00:00Z' },
      header: vi.fn().mockReturnValue('corr-123'),
    });
    const res = createMockResponse();

    mockProcessEvents.mockImplementationOnce(() => {
      throw new Error('boom');
    });

    postEvents(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    expect(logger.error).toHaveBeenCalledWith(
      {
        correlationId: 'corr-123',
        error: expect.any(Error),
      },
      'Failed to process event'
    );
  });
});
