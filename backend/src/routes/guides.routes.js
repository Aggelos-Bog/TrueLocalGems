import { Router } from "express";
import * as guideController from "../controllers/guides.controller.js";

import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/public", guideController.getAllPublicGuides);
router.get("/search", guideController.searchGuides);
router.get("/favorites", authenticateToken, guideController.getFavorites);
router.get("/:id", guideController.getGuide);
router.put("/:id", authenticateToken, guideController.updateGuide);
router.post("/:id/photo",authenticateToken, guideController.uploadPhoto);
router.post("/:id/favorite", authenticateToken, guideController.toggleFavorite);

export default router;
