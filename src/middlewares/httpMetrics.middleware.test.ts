import { createMockRequest, createMockResponse } from '#tests/mocks.js';
import { describe, expect, it, vi } from 'vitest';

vi.mock('#infra/logger.js', () => ({
  logger: {
    info: vi.fn(),
  },
}));

import { logger } from '#infra/logger.js';

import { httpMetricsMiddleware } from './httpMetrics.middleware.js';

describe('httpMetrics.middleware', () => {
  it('logs duration and status on response finish', () => {
    const req = createMockRequest();
    const res = createMockResponse();
    res.statusCode = 204;

    const next = vi.fn();
    const onMock = vi.fn();
    res.on = onMock as any;

    const hrtimeSpy = vi
      .spyOn(process.hrtime, 'bigint')
      .mockReturnValueOnce(0n)
      .mockReturnValueOnce(5_000_000n);

    httpMetricsMiddleware(req, res, next);

    expect(onMock).toHaveBeenCalledWith('finish', expect.any(Function));

    const finishHandler = onMock.mock.calls[0][1];
    finishHandler();

    expect(logger.info).toHaveBeenCalledWith(
      {
        durationMs: 5,
        statusCode: 204,
      },
      'Request completed'
    );

    hrtimeSpy.mockRestore();
  });
});
