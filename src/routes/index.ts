import { Express } from 'express';

import healthRouter from './health.routes.js';
import apiV1Router from './v1/index.js';

const setupRoutes = (app: Express) => {
  app.use('/health', healthRouter);

  app.use('/api/v1', apiV1Router);
};

export default setupRoutes;
