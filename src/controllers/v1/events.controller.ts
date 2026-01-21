import { marketingEventsSchema } from '#schemas/event.schema.js';
import * as eventsService from '#services/events.service.js';
import { AuthenticatedRequest } from '#types/auth.js';
import { RequestHandler } from 'express';
import z from 'zod';

export const postEvents: RequestHandler = (req: AuthenticatedRequest, res) => {
  const correlationId = req.header('x-correlation-id');

  const parseResult = marketingEventsSchema.safeParse(req.body);

  if (!parseResult.success) {
    console.warn(
      {
        correlationId,
        errors: z.treeifyError(parseResult.error),
      },
      'Invalid event payload'
    );

    throw parseResult.error;
  }

  try {
    // Won't await to respond faster and process events in background
    void eventsService.process(parseResult.data, {
      ...(req.user && { userId: req.user.id }),
    });

    console.info('Events processed successfully');

    return res.status(202).json({
      status: 'accepted',
    });
  } catch (error) {
    console.error(
      {
        correlationId,
        error,
      },
      'Failed to process event'
    );

    return res.status(500).json({
      error: 'Internal server error',
    });
  }
};
