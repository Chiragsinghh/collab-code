import express from 'express';
import { deploy } from '../controllers/deployController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, deploy);

export default router;
