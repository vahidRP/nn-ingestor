import { randomUUID } from 'crypto';
import { RequestHandler } from 'express';

export const correlationIdMiddleware: RequestHandler = (req, res, next) => {
  req.headers['x-correlation-id'] ??= randomUUID();
  next();
};
