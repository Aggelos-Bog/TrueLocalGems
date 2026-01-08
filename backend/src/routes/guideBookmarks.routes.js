import { Router } from "express";
import * as guideBookmarksController from "../controllers/guideBookmarks.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

// Protect all routes with authentication
router.use(authenticateToken);

// POST /api/guide-bookmarks/:requestId - Toggle bookmark
router.post("/:requestId", guideBookmarksController.toggleBookmark);

// GET /api/guide-bookmarks/ - Get all bookmarks for the logged-in guide
router.get("/", guideBookmarksController.getBookmarks);

export default router;
