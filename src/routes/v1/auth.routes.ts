import * as authController from '#controllers/v1/auth.controller.js';
import { authMiddleware } from '#middlewares/auth.middleware.js';
import express from 'express';

const authRoutes = express.Router();

authRoutes.post('/login', authController.postLogin);
authRoutes.get('/me', authMiddleware, authController.getMe);

export default authRoutes;
