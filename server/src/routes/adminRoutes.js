import { Router } from 'express';
import { ROLES } from '../config/env.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createStoreSchema, createUserSchema, idParamSchema } from '../validators/schemas.js';
import * as userService from '../services/userService.js';
import * as storeService from '../services/storeService.js';
import * as dashboardService from '../services/dashboardService.js';

const router = Router();

router.use(authenticate, authorize(ROLES.ADMIN));

router.get(
  '/dashboard',
  asyncHandler(async (_req, res) => {
    res.json(await dashboardService.getAdminOverview());
  }),
);

router.get(
  '/users',
  asyncHandler(async (req, res) => {
    res.json(await userService.listUsers(req.query));
  }),
);

router.post(
  '/users',
  validateBody(createUserSchema),
  asyncHandler(async (req, res) => {
    res.status(201).json(await userService.createUser(req.body));
  }),
);

router.get(
  '/users/:id',
  validateParams(idParamSchema),
  asyncHandler(async (req, res) => {
    res.json(await userService.getUserById(req.validatedParams.id));
  }),
);

router.get(
  '/owners',
  asyncHandler(async (_req, res) => {
    res.json({ data: await userService.listOwnerCandidates() });
  }),
);

router.get(
  '/stores',
  asyncHandler(async (req, res) => {
    res.json(await storeService.listStoresForAdmin(req.query));
  }),
);

router.post(
  '/stores',
  validateBody(createStoreSchema),
  asyncHandler(async (req, res) => {
    res.status(201).json(await storeService.createStore(req.body));
  }),
);

export default router;
