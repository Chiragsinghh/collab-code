import express from 'express';
import { getHistory } from '../controllers/chatController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/:roomId', protect, getHistory);

export default router;
