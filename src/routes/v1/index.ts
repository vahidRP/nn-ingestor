import express from 'express';

import authRoutes from './auth.routes.js';
import eventsRoutes from './events.routes.js';

const apiV1Router = express.Router();

apiV1Router.use('/auth', authRoutes);
apiV1Router.use('/events', eventsRoutes);

export default apiV1Router;
