import { Router } from "express";
import * as guideController from "../controllers/guides.controller.js";

import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/public", guideController.getAllPublicGuides);
router.get("/:id", guideController.getGuide);
router.put("/:id", authenticateToken, guideController.updateGuide);
router.post("/:id/photo",authenticateToken, guideController.uploadPhoto);

export default router;
