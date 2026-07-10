import express from 'express';
import { signup, login, getUser, updateProfile } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, getUser);
router.put('/profile', protect, updateProfile);

export default router;