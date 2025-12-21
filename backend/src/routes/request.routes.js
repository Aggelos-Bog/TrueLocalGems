import express from "express";
import { createRequest, getAllRequests, getRequestById } from "../controllers/request.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Ideally protected
// router.post("/", verifyToken, createRequest);
router.post("/", authenticateToken, createRequest);
router.get("/", authenticateToken, getAllRequests);
router.get("/:id", authenticateToken, getRequestById);

export default router;
