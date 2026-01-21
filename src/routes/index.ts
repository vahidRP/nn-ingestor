import { Express } from 'express';

import healthRouter from './health.routes.js';

const setupRoutes = (app: Express) => {
  app.use('/health', healthRouter);
};

export default setupRoutes;
