import * as eventsController from '#controllers/v1/events.controller.js';
import { authMiddleware } from '#middlewares/auth.middleware.js';
import express from 'express';

const eventsRoutes = express.Router();

eventsRoutes.post('/', authMiddleware, eventsController.postEvents);

export default eventsRoutes;
