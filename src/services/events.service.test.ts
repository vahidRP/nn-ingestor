import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('#infra/logger.js', () => ({
  logger: {
    info: vi.fn(),
  },
}));

import { logger } from '#infra/logger.js';

import { process } from './events.service.js';

describe('events.service', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('logs receipt and completion of processed events', async () => {
    const events = [
      {
        context: { page: '/home' },
        eventType: 'page_view' as const,
        timestamp: new Date('2025-01-01T00:00:00Z'),
      },
    ];

    const processing = process(events, { userId: 10 });

    await vi.runAllTimersAsync();
    await processing;

    expect(logger.info).toHaveBeenNthCalledWith(
      1,
      {
        events: [
          {
            context: { page: '/home' },
            eventType: 'page_view',
            timestamp: new Date('2025-01-01T00:00:00Z'),
            userId: 10,
          },
        ],
      },
      'Received Events!'
    );
    expect(logger.info).toHaveBeenNthCalledWith(2, 'Processed 1 events! Total in payload: 0');
  });
});
