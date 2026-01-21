import pino from 'pino';

import { requestContext } from './requestContext.js';

export const logger = pino({
  base: {
    environment: process.env.NODE_ENV ?? 'development',
    service: 'marketing-events-api',
  },
  formatters: {
    level(label) {
      return { level: label };
    },
  },

  level: process.env.LOG_LEVEL ?? 'info',

  mixin() {
    const context = requestContext.getStore();
    if (!context) return {};

    return {
      correlationId: context.correlationId,
      method: context.method,
      path: context.path,
    };
  },

  redact: {
    censor: '[REDACTED]',
    paths: ['userId', 'headers.authorization', 'headers["x-api-key"]'],
  },

  timestamp: pino.stdTimeFunctions.isoTime,
});
