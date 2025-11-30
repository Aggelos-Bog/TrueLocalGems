import { Router } from "express";
import * as guideController from "../controllers/guides.controller.js";

const router = Router();

router.get("/public", guideController.getAllPublicGuides);
router.get("/:id", guideController.getGuide);
router.put("/:id", guideController.updateGuide);
router.post("/:id/photo", guideController.uploadPhoto);

export default router;
