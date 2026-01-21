import { logger } from '#infra/logger.js';
import { RequestHandler } from 'express';

export const httpMetricsMiddleware: RequestHandler = (req, res, next) => {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;

    logger.info(
      {
        durationMs,
        statusCode: res.statusCode,
      },
      'Request completed'
    );
  });

  next();
};
