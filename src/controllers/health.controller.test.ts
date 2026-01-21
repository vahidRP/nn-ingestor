import { createMockRequest, createMockResponse } from '#tests/mocks.js';
import { describe, expect, it, vi } from 'vitest';

import { getHealth } from './health.controller.js';

describe('health.controller', () => {
  it('returns ok status payload', () => {
    const req = createMockRequest();
    const res = createMockResponse();

    getHealth(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ status: 'ok' });
  });
});
