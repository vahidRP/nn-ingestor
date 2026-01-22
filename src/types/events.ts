import { MarketingEventInput } from '#schemas/event.schema.js';

export interface EnrichedMarketingEventInput extends MarketingEventInput {
  [key: string]: unknown;
  context?: MarketingEventInput['context'];

  ingestedAt: Date;
  schemaVersion: `${string}.${string}.${string}`;
}
