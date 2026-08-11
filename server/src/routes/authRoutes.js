import { Router } from 'express';
import * as authService from '../services/authService.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { registerSchema, loginSchema, updatePasswordSchema } from '../validators/schemas.js';

const router = Router();

router.post(
  '/register',
  validateBody(registerSchema),
  asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  }),
);

router.post(
  '/login',
  validateBody(loginSchema),
  asyncHandler(async (req, res) => {
    const result = await authService.login(req.body);
    res.json(result);
  }),
);

router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ user: req.user });
  }),
);

router.patch(
  '/password',
  authenticate,
  validateBody(updatePasswordSchema),
  asyncHandler(async (req, res) => {
    await authService.updatePassword(req.user.id, req.body);
    res.json({ message: 'Password updated successfully' });
  }),
);

export default router;
