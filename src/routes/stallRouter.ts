import { Router } from 'express';
import { StallController } from '../controllers/stallController.ts';
import { validate } from '../middlewares/validate.ts';
import { authenticate } from '../middlewares/auth.ts';
import { authorize } from '../middlewares/authorize.ts';
import {
  createStallSchema,
  idParamSchema,
  stallQuerySchema,
  updateStallSchema,
} from '../schemas/stallSchema.ts';

const stallRouter = Router();
const stallController = new StallController();

// Publik: boleh dibaca siapa saja.
stallRouter.get('/', validate(stallQuerySchema, 'query'), stallController.getStalls);
stallRouter.get('/:id', validate(idParamSchema, 'params'), stallController.getStallById);
stallRouter.get('/:id/menus', validate(idParamSchema, 'params'), stallController.getStallMenus);

// Urutan penting: authenticate (401) -> authorize (403) -> validate (400).
stallRouter.post(
  '/',
  authenticate,
  authorize('owner', 'admin'),
  validate(createStallSchema, 'body'),
  stallController.createStall,
);
stallRouter.put(
  '/:id',
  authenticate,
  authorize('owner', 'admin'),
  validate(idParamSchema, 'params'),
  validate(updateStallSchema, 'body'),
  stallController.updateStall,
);
stallRouter.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  validate(idParamSchema, 'params'),
  stallController.deleteStall,
);

export { stallRouter };