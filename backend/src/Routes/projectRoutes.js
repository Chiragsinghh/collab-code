import express from 'express';
import Project from '../models/Project.js';

const router = express.Router();


router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const projects = await Project.find({
      $or: [
        { owner: userId },
        { members: userId }
      ]
    }).sort({ updatedAt: -1 });

    res.json(projects);
  } catch (error) {
    console.error("Error fetching user projects:", error);
    res.status(500).json({ message: "Server error fetching projects" });
  }
});

export default router;