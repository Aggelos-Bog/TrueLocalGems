import express from "express";
import { register, login, verifyEmail, getMe } from "../controllers/auth.controller.js";

import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/verify-email", verifyEmail);
router.get("/me", authenticateToken, getMe);

export default router;
