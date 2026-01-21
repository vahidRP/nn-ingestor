import errorHandlerMiddleware from '#middlewares/errorHandler.middleware.js';
import setupRoutes from '#routes/index.js';
import createServer from '#server.js';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

const app = express();

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

app.use(errorHandlerMiddleware);

setupRoutes(app);

createServer(app);
