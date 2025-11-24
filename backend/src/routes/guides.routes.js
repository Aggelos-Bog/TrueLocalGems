import express from "express";
import { getGuide, updateGuide } from "../controllers/guides.controller.js";

const router = express.Router();

// GET guide by ID
router.get("/:id", getGuide);

// UPDATE guide by ID
router.put("/:id", updateGuide);

export default router;
