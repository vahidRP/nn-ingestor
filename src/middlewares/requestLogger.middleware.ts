import { requestContext } from '#infra/requestContext.js';
import { RequestHandler } from 'express';

export const requestLoggerMiddleware: RequestHandler = (req, res, next) => {
  const correlationId = req.header('x-correlation-id') ?? '<no-correlation-id>';

  requestContext.run(
    {
      correlationId,
      method: req.method,
      path: req.path,
    },
    next
  );
};
