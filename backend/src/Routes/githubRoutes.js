import express from 'express';
import { listRepos, importRepo } from '../controllers/githubController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/repos', protect, listRepos);
router.post('/import', protect, importRepo);

export default router;
