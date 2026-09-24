import express from 'express';
import { login, setPassword, logout, registerDonor, loginDonor } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/donor/register', registerDonor);
router.post('/donor/login', loginDonor);
router.put('/set-password/:token', setPassword); // public — no auth required, the token IS the auth
router.post('/logout', protect, logout);

export default router;