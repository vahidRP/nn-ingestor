import { getMe, postLogin } from '#controllers/v1/auth.controller.js';
import { authMiddleware } from '#middlewares/auth.middleware.js';
import express from 'express';

const authRoutes = express.Router();

authRoutes.post('/login', postLogin);
authRoutes.get('/me', authMiddleware, getMe);

export default authRoutes;
