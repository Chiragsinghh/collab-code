import express from 'express';
import { signup, login, oauthLogin, getUser, updateProfile, getAuthConfig, googleLogin, githubLogin } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/config', getAuthConfig);
router.post('/signup', signup);
router.post('/login', login);
router.post('/oauth', oauthLogin);
router.post('/google', googleLogin);
router.post('/github', githubLogin);
router.get('/me', protect, getUser);
router.put('/profile', protect, updateProfile);

export default router;