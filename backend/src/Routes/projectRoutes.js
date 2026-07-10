import express from 'express';
import { create, getProject, updateTree, getMyProjects, remove } from '../controllers/projectController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, create);
router.get('/', protect, getMyProjects);
router.get('/:roomId', protect, getProject);
router.put('/:roomId/tree', protect, updateTree);
router.delete('/:roomId', protect, remove);

export default router;
