import { Router } from 'express';
import { ROLES } from '../config/env.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ratingSchema, storeIdParamSchema } from '../validators/schemas.js';
import * as storeService from '../services/storeService.js';

const router = Router();

router.use(authenticate, authorize(ROLES.USER));

router.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(await storeService.listStoresForUser(req.user.id, req.query));
  }),
);

router.put(
  '/:storeId/rating',
  validateParams(storeIdParamSchema),
  validateBody(ratingSchema),
  asyncHandler(async (req, res) => {
    const result = await storeService.upsertRating(
      req.user.id,
      req.validatedParams.storeId,
      req.body.score,
    );
    res.json(result);
  }),
);

export default router;
