import z from 'zod';

export const marketingEventSchema = z
  .object({
    context: z.record(z.string(), z.unknown()).optional(),
    eventType: z.enum(['page_view', 'click', 'conversion']),
    timestamp: z.coerce.date(),
  })
  .strip();

export type MarketingEventInput = z.infer<typeof marketingEventSchema>;

export const marketingEventsSchema = z.preprocess(
  (input) => (Array.isArray(input) ? input : [input]),
  z.array(marketingEventSchema)
);
export type MarketingEventsInput = z.infer<typeof marketingEventsSchema>;
