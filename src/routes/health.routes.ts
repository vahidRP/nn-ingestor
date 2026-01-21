import * as healthController from '#controllers/health.controller.js';
import express from 'express';

const healthRouter = express.Router();

healthRouter.get('/', healthController.getHealth);

export default healthRouter;
