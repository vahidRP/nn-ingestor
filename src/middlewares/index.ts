import { correlationIdMiddleware } from '#middlewares/correlationId.middleware.js';
import errorHandlerMiddleware from '#middlewares/errorHandler.middleware.js';
import compression from 'compression';
import cors from 'cors';
import express, { Express } from 'express';
import helmet from 'helmet';

import { httpMetricsMiddleware } from './httpMetrics.middleware.js';
import { requestLoggerMiddleware } from './requestLogger.middleware.js';

export const attachBeforeMiddlewares = (app: Express) => {
  // compress all responses
  app.use(compression());

  app.use(helmet());

  app.use(express.json({ strict: true }));

  app.use(
    cors({
      credentials: true,
      origin: ['https://localhost'],
    })
  );

  app.use(correlationIdMiddleware);
  app.use(requestLoggerMiddleware);
  app.use(httpMetricsMiddleware);
};

export const attachAfterMiddlewares = (app: Express) => {
  // Error handling middleware should be the last middleware
  app.use(errorHandlerMiddleware);
};
