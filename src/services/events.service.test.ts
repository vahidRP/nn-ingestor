import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('#infra/logger.js', () => ({
  logger: {
    info: vi.fn(),
  },
}));

import { logger } from '#infra/logger.js';

import { process } from './events.service.js';

const runProcess = async (events: Parameters<typeof process>[0], now: string): Promise<unknown> => {
  vi.setSystemTime(new Date(now));
  const processing = process(events);

  await vi.runAllTimersAsync();
  await processing;

  return vi.mocked(logger.info).mock.calls[0][0];
};

const buildEvent = (overrides: Partial<Parameters<typeof process>[0][number]> = {}) => ({
  eventType: 'page_view' as const,
  timestamp: new Date('2024-01-01T00:00:00Z'),
  ...overrides,
});

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
      buildEvent({
        context: { url: 'https://example.com/?utm_source=test' },
      }),
    ];

    const logPayload = await runProcess(events, '2024-01-01T00:00:00Z');

    expect(logPayload).toEqual({
      dropped: 0,
      droppedReasons: [],
      processed: 1,
      received: 1,
    });
    expect(logger.info).toHaveBeenNthCalledWith(2, 'Processed 1 events! Total in payload: 0');
  });

  it('drops events when consent is denied', async () => {
    const events = [buildEvent({ context: { consent: false } })];

    const logPayload = await runProcess(events, '2024-01-02T00:00:00Z');

    expect(logPayload).toEqual({
      dropped: 1,
      droppedReasons: ['consent_denied'],
      processed: 0,
      received: 1,
    });
    expect(logger.info).toHaveBeenNthCalledWith(2, 'Processed 0 events! Total in payload: 0');
  });

  it('drops events with out-of-range timestamps', async () => {
    const events = [
      buildEvent({
        timestamp: new Date('2023-01-01T00:00:00Z'),
      }),
    ];

    const logPayload = await runProcess(events, '2024-01-01T00:00:00Z');

    expect(logPayload).toEqual({
      dropped: 1,
      droppedReasons: ['timestamp_out_of_range'],
      processed: 0,
      received: 1,
    });
  });

  it('dedupes events after context key normalization', async () => {
    const events = [
      buildEvent({ context: { utm_source: 'newsletter' } }),
      buildEvent({ context: { utmSource: 'newsletter' } }),
    ];

    const logPayload = await runProcess(events, '2024-01-03T00:00:00Z');

    expect(logPayload).toEqual({
      dropped: 1,
      droppedReasons: ['duplicate'],
      processed: 1,
      received: 2,
    });
  });

  it('dedupes events after URL query stripping', async () => {
    const events = [
      buildEvent({ context: { url: 'https://example.com/?utm_source=a' } }),
      buildEvent({ context: { url: 'https://example.com/' } }),
    ];

    const logPayload = await runProcess(events, '2024-01-04T00:00:00Z');

    expect(logPayload).toEqual({
      dropped: 1,
      droppedReasons: ['duplicate'],
      processed: 1,
      received: 2,
    });
  });

  it('dedupes events after IP anonymization', async () => {
    const events = [
      buildEvent({ context: { ip: '10.0.0.1' } }),
      buildEvent({ context: { ip: '10.0.0.2' } }),
    ];

    const logPayload = await runProcess(events, '2024-01-05T00:00:00Z');

    expect(logPayload).toEqual({
      dropped: 1,
      droppedReasons: ['duplicate'],
      processed: 1,
      received: 2,
    });
  });

  it('dedupes when non-allowlisted context is removed', async () => {
    const events = [
      buildEvent({ context: { page: '/a' } }),
      buildEvent({ context: { page: '/b' } }),
    ];

    const logPayload = await runProcess(events, '2024-01-06T00:00:00Z');

    expect(logPayload).toEqual({
      dropped: 1,
      droppedReasons: ['duplicate'],
      processed: 1,
      received: 2,
    });
  });
});
