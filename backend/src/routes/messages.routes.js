import express from "express";
import { getChatHistory, getMyChats } from "../controllers/messages.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Get all chats for current user
router.get("/", authenticateToken, getMyChats);

// Get chat history for a specific request
router.get("/:request_id", authenticateToken, getChatHistory);

export default router;
