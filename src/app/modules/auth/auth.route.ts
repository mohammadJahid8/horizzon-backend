import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { AuthController } from './auth.controller';
const router = express.Router();

router.post('/login', AuthController.loginUser);
router.post('/google', AuthController.loginWithGoogle);
router.post('/refresh-token', AuthController.refreshToken);

router.post(
  '/change-password',

  auth(ENUM_USER_ROLE.PARTNER, ENUM_USER_ROLE.PRO),
  AuthController.changePassword
);
router.post('/forgot-password', AuthController.forgotPass);
router.post('/verify-otp', AuthController.verifyOtp);

router.post('/reset-password', AuthController.resetPassword);

export const AuthRoutes = router;
