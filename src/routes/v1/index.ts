import express from 'express';

import authRoutes from './auth.routes.js';

const apiV1Router = express.Router();

apiV1Router.use('/auth', authRoutes);

export default apiV1Router;
