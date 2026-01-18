import express from "express";
import {
  createReview,
  getGuideReviews,
  checkReviewStatus,
} from "../controllers/review.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Create a review (requires authentication)
router.post("/", authenticateToken, createReview);

// Get all reviews for a guide (public endpoint)
router.get("/guide/:guideId", getGuideReviews);

// Check review status for a booking (requires authentication)
router.get("/check/:bookingId", authenticateToken, checkReviewStatus);

export default router;
