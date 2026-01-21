import { attachAfterMiddlewares, attachBeforeMiddlewares } from '#middlewares/index.js';
import setupRoutes from '#routes/index.js';
import createServer from '#server.js';
import express from 'express';

const app = express();

attachBeforeMiddlewares(app);

setupRoutes(app);

attachAfterMiddlewares(app);

createServer(app);
