import { logger } from '#infra/logger.js';
import { MarketingEventsInput } from '#schemas/event.schema.js';

let payload: MarketingEventsInput = [];

/**
 * In production this could:
 * - Transform the event
 * - Enrich with additional context
 * - Forward to Adobe Experience Platform
 * - Push to a queue (SQS / Kafka)
 */
export const process = async (
  events: MarketingEventsInput,
  additionalPayload?: Record<string, unknown>
): Promise<void> => {
  const mergedPayloadEvents = events.map((event) => ({
    ...event,
    ...additionalPayload,
  }));

  logger.info({ events: mergedPayloadEvents }, 'Received Events!');
  payload.push(...mergedPayloadEvents);

  // Mocked external call
  await new Promise((resolve) => setTimeout(resolve, 3000));

  payload = payload.slice(0, -mergedPayloadEvents.length); // Clear payload after processing

  logger.info(
    `Processed ${mergedPayloadEvents.length} events! Total in payload: ${payload.length}`
  );

  return;
};
