import express from "express";
import { runPreview } from "../controllers/previewController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/fullstack", protect, runPreview);

export default router;

