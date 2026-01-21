import { JwtUserPayload } from '#schemas/auth.schema.js';
import { Request as BaseRequest } from 'express';

export interface AuthenticatedRequest extends BaseRequest {
  user?: JwtUserPayload;
}

export interface DBUser {
  email: string;
  id: number;
  name: string;
  role: 'admin' | 'guest' | 'user';
}
