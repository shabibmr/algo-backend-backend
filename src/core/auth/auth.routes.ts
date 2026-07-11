import { Router } from 'express';
import {
  authController,
  loginSchema,
  refreshSchema,
  changePasswordSchema,
} from './auth.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshSchema), authController.refresh);

// Tasks 44-46: protected auth routes
router.get('/me', authenticate, authController.me);
router.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword,
);
router.post('/logout', authenticate, authController.logout);

export const authRoutes = router;
export default router;
