import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContext {
  correlationId: string;
  method?: string;
  path?: string;
}

export const requestContext = new AsyncLocalStorage<RequestContext>();
