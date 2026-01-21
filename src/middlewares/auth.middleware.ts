import { jwtUserPayloadSchema } from '#schemas/auth.js';
import { AuthenticatedRequest } from '#types/auth.js';
import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware: RequestHandler = (req: AuthenticatedRequest, res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = header.split(' ')[1];

  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) throw new Error('JWT_SECRET is not defined in environment variables');

    const payload = jwt.verify(token, JWT_SECRET);

    const validatedPayload = jwtUserPayloadSchema.parse(payload);

    req.user = validatedPayload;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
