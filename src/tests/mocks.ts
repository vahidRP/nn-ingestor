import type { AuthenticatedRequest } from '#types/auth.js';
import type { NextFunction, Request, Response } from 'express';

import { attachAfterMiddlewares, attachBeforeMiddlewares } from '#middlewares/index.js';
import setupRoutes from '#routes/index.js';
import express from 'express';
import { vi } from 'vitest';

type MockRequestOptions = Partial<Request> & {
  body?: Request['body'];
  headers?: Request['headers'];
  params?: Request['params'];
  query?: Request['query'];
};

export const createMockRequest = (options: MockRequestOptions = {}): Request => {
  return {
    body: {},
    header: function (key: string) {
      return this.headers[key];
    },
    headers: {},
    params: {},
    query: {},
    ...options,
  } as Request;
};

export const createMockAuthRequest = (
  options: Partial<AuthenticatedRequest> = {}
): AuthenticatedRequest => {
  return {
    body: {},
    header: function (key: string) {
      return this.headers[key];
    },
    headers: {},
    params: {},
    query: {},
    ...options,
  } as AuthenticatedRequest;
};

export const createMockResponse = (): Response => {
  const res: Partial<Response> = {};

  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  res.end = vi.fn().mockReturnValue(res);
  res.setHeader = vi.fn().mockReturnValue(res);
  res.on = vi.fn().mockReturnValue(res);

  return res as Response;
};

export const createMockNext = (): NextFunction => vi.fn();

export const createMockApp = () => {
  const app = express();

  attachBeforeMiddlewares(app);
  setupRoutes(app);
  attachAfterMiddlewares(app);

  return app;
};
