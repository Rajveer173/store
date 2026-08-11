import { Router } from 'express';
import { ROLES } from '../config/env.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as dashboardService from '../services/dashboardService.js';

const router = Router();

router.use(authenticate, authorize(ROLES.OWNER));

router.get(
  '/dashboard',
  asyncHandler(async (req, res) => {
    res.json(await dashboardService.getOwnerOverview(req.user.id));
  }),
);

router.get(
  '/raters',
  asyncHandler(async (req, res) => {
    res.json(await dashboardService.listOwnerRaters(req.user.id, req.query));
  }),
);

export default router;
