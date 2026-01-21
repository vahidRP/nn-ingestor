import { ErrorRequestHandler } from 'express';
import z, { ZodError } from 'zod';

const errorHandlerMiddleware: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof ZodError) {
    return res.status(400).json(z.treeifyError(err));
  }

  console.error(err);

  const errorCode: number =
    'status' in err && err.status ? parseInt(err.status as string, 10) : 500;
  const errorMessage: string =
    'message' in err && err.message ? (err.message as string) : 'Internal Server Error';

  res.status(errorCode).json({
    message: errorMessage,
  });
};

export default errorHandlerMiddleware;
