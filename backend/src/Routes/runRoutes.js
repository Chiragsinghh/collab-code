import express from "express";
import { execute } from "../controllers/runController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, execute);

export default router;
