import express from "express";
import { updateProjectTree } from "../services/projectService.js";

const router = express.Router();

/* ✅ Save Tree */
router.post("/:roomId", async (req, res) => {
  const { roomId } = req.params;
  const { tree } = req.body; // Expecting tree in body

  try {
    const project = await updateProjectTree(roomId, tree);
    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ error: "Save failed" });
  }
});

export default router;
