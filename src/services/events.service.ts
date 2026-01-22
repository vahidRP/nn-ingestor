import { logger } from '#infra/logger.js';
import { MarketingEventsInput } from '#schemas/event.schema.js';
import { EnrichedMarketingEventInput } from '#types/events.js';
import { createHash } from 'node:crypto';

let payload: MarketingEventsInput = [];
const dedupeCache = new Map<string, number>();

const DEDUPE_WINDOW_MS = 5 * 60 * 1000;
const MAX_EVENT_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const FUTURE_SKEW_MS = 5 * 60 * 1000;

const CONTEXT_ALLOWLIST = new Set([
  'campaignId',
  'consent',
  'contentId',
  'doNotTrack',
  'email',
  'ip',
  'landingPage',
  'medium',
  'optOut',
  'phone',
  'referrer',
  'source',
  'url',
  'utmCampaign',
  'utmContent',
  'utmMedium',
  'utmSource',
  'utmTerm',
]);

const PII_KEYS = new Set(['email', 'phone']);

/**
 * In production this could:
 * - Transform the event
 * - Enrich with additional context
 * - Forward to Adobe Experience Platform
 * - Push to a queue (SQS / Kafka)
 */
const toCamelCase = (value: string): string => {
  const normalized = value.replace(/[-_]+(.)?/g, (_, chr: string) =>
    chr ? chr.toUpperCase() : ''
  );

  return normalized.charAt(0).toLowerCase() + normalized.slice(1);
};

const hashValue = (value: string): string =>
  `hash:${createHash('sha256').update(value).digest('hex')}`;

const anonymizeIp = (value: string): null | string => {
  const ipv4Parts = value.split('.');
  if (ipv4Parts.length === 4) {
    return `${ipv4Parts[0]}.${ipv4Parts[1]}.${ipv4Parts[2]}.0`;
  }

  return null;
};

const stripQueryParams = (value: string): string => {
  try {
    const parsed = new URL(value);
    parsed.search = '';
    parsed.hash = '';
    return parsed.toString();
  } catch {
    return value;
  }
};

const shouldDropForConsent = (context?: Record<string, unknown>): boolean => {
  if (!context) return false;
  if (context.doNotTrack === true) return true;
  if (context.optOut === true) return true;
  if (context.consent === false) return true;

  return false;
};

const sanitizeContext = (
  context?: Record<string, unknown>
): Record<string, unknown> | undefined => {
  if (!context) return undefined;

  const sanitizedEntries: [string, unknown][] = [];
  for (const [key, rawValue] of Object.entries(context)) {
    const normalizedKey = toCamelCase(key);
    if (!CONTEXT_ALLOWLIST.has(normalizedKey)) continue;

    if (typeof rawValue === 'string') {
      if (PII_KEYS.has(normalizedKey)) {
        sanitizedEntries.push([normalizedKey, hashValue(rawValue)]);
        continue;
      }

      if (normalizedKey === 'ip') {
        const masked = anonymizeIp(rawValue);
        if (masked) sanitizedEntries.push([normalizedKey, masked]);
        continue;
      }

      if (
        normalizedKey === 'url' ||
        normalizedKey === 'landingPage' ||
        normalizedKey === 'referrer'
      ) {
        sanitizedEntries.push([normalizedKey, stripQueryParams(rawValue)]);
        continue;
      }
    }

    sanitizedEntries.push([normalizedKey, rawValue]);
  }

  return sanitizedEntries.length ? Object.fromEntries(sanitizedEntries) : undefined;
};

const isTimestampOutOfRange = (timestamp: Date): boolean => {
  const now = Date.now();
  const time = timestamp.getTime();

  return time > now + FUTURE_SKEW_MS || now - time > MAX_EVENT_AGE_MS;
};

const buildDedupeKey = (event: Record<string, unknown>): string =>
  createHash('sha256').update(JSON.stringify(event)).digest('hex');

const isDuplicate = (key: string, now: number): boolean => {
  for (const [entryKey, entryTime] of dedupeCache.entries()) {
    if (now - entryTime > DEDUPE_WINDOW_MS) dedupeCache.delete(entryKey);
  }

  if (dedupeCache.has(key)) return true;
  dedupeCache.set(key, now);
  return false;
};

export const process = async (
  events: MarketingEventsInput,
  additionalPayload?: Record<string, unknown>
): Promise<void> => {
  const dropped: { event: MarketingEventsInput[number]; reason: string }[] = [];
  const processedEvents = events
    .map<EnrichedMarketingEventInput | null>((event) => {
      const enrichedEvent = {
        ...event,
        ...additionalPayload,
        ingestedAt: new Date(),
        schemaVersion: '1.0.0',
      } as const;

      if (shouldDropForConsent(enrichedEvent.context)) {
        dropped.push({ event, reason: 'consent_denied' });
        return null;
      }

      if (isTimestampOutOfRange(enrichedEvent.timestamp)) {
        dropped.push({ event, reason: 'timestamp_out_of_range' });
        return null;
      }

      const sanitizedContext = sanitizeContext(enrichedEvent.context);

      const dedupeKey = buildDedupeKey({
        ...enrichedEvent,
        context: sanitizedContext,
      });

      if (isDuplicate(dedupeKey, Date.now())) {
        dropped.push({ event, reason: 'duplicate' });
        return null;
      }

      return {
        ...enrichedEvent,
        context: sanitizedContext,
      };
    })
    .filter((event): event is EnrichedMarketingEventInput => event !== null);

  logger.info(
    {
      dropped: dropped.length,
      droppedReasons: dropped.map(({ reason }) => reason),
      processed: processedEvents.length,
      received: events.length,
    },
    'Received Events!'
  );
  payload.push(...processedEvents);

  /**
   * Mocked external call
   * This could be an API call, database write, queue push, etc.
   */
  await new Promise((resolve) => setTimeout(resolve, 1000));

  payload = payload.slice(0, -processedEvents.length); // Clear payload after processing

  logger.info(`Processed ${processedEvents.length} events! Total in payload: ${payload.length}`);

  return;
};
