import { randomUUID } from 'crypto';
import { RequestHandler } from 'express';

export const correlationIdMiddleware: RequestHandler = (req, res, next) => {
  req.headers['x-correlation-id'] ??= randomUUID();
  res.setHeader('X-Correlation-ID', req.headers['x-correlation-id'] as string);
  next();
};
