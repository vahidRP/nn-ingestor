import { loginRequestSchema } from '#schemas/auth.schema.js';
import { findUserByEmail } from '#services/users.service.js';
import { AuthenticatedRequest } from '#types/auth.js';
import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

export const postLogin: RequestHandler = (req, res) => {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not defined in environment variables');

  const { email, password } = loginRequestSchema.parse(req.body);

  const user = findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Must also check for password but skipping for now

  // const isValid = await bcrypt.compare(password, user.password_hash);
  // if (!isValid) {
  //   return res.status(401).json({ message: 'Invalid credentials' });
  // }

  const token = jwt.sign(user, JWT_SECRET, {
    expiresIn: '1h',
  });

  res.json({ token });
};

export const getMe: RequestHandler = (req: AuthenticatedRequest, res) => {
  res.json(req.user);
};
