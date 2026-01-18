import * as reviewService from "../services/review.service.js";
import db from "../config/database.js";

/**
 * Create a new review
 * POST /api/reviews
 */
export async function createReview(req, res) {
  try {
    const userId = req.user.id;
    const { booking_id, rating, review_text } = req.body;

    // Validate required fields
    if (!booking_id || rating === undefined) {
      return res.status(400).json({ 
        error: "Missing required fields: booking_id and rating are required" 
      });
    }

    // Validate rating range
    if (rating < 0 || rating > 5) {
      return res.status(400).json({ 
        error: "Rating must be between 0 and 5" 
      });
    }

    const review = await reviewService.createReview(
      userId,
      booking_id,
      rating,
      review_text
    );

    res.status(201).json(review);
  } catch (err) {
    console.error("Error creating review:", err);
    
    // Handle specific error codes
    if (err.statusCode === 404) {
      return res.status(404).json({ error: err.message });
    }
    if (err.statusCode === 400) {
      return res.status(400).json({ error: err.message });
    }
    if (err.statusCode === 403) {
      return res.status(403).json({ error: err.message });
    }
    if (err.statusCode === 409) {
      return res.status(409).json({ error: err.message });
    }
    
    res.status(500).json({ error: "Failed to create review" });
  }
}

/**
 * Get all reviews for a guide
 * GET /api/reviews/guide/:guideId
 */
export async function getGuideReviews(req, res) {
  try {
    const { guideId } = req.params;

    if (!guideId) {
      return res.status(400).json({ error: "Guide ID is required" });
    }

    const reviews = await reviewService.getReviewsByGuide(guideId);

    res.status(200).json(reviews);
  } catch (err) {
    console.error("Error fetching guide reviews:", err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
}

/**
 * Check review status for a booking
 * GET /api/reviews/check/:bookingId
 */
export async function checkReviewStatus(req, res) {
  try {
    const userId = req.user.id;
    const { bookingId } = req.params;

    if (!bookingId) {
      return res.status(400).json({ error: "Booking ID is required" });
    }

    // Get booking details
    const bookingResult = await db.query(
      `SELECT b.booking_id, b.status, b.request_id
       FROM booking b
       WHERE b.booking_id = $1`,
      [bookingId]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const booking = bookingResult.rows[0];

    // Check if user owns the request
    const ownerCheck = await db.query(
      `SELECT user_id FROM user_does_request WHERE request_id = $1 AND user_id = $2`,
      [booking.request_id, userId]
    );

    const ownsBooking = ownerCheck.rows.length > 0;
    const isCompleted = booking.status === 'completed';
    const canReview = ownsBooking && isCompleted;

    // Check if review exists
    const hasReviewed = await reviewService.checkReviewExists(userId, bookingId);
    const review = hasReviewed 
      ? await reviewService.getReviewByUserAndBooking(userId, bookingId)
      : null;

    res.status(200).json({
      canReview,
      hasReviewed,
      review,
      bookingStatus: booking.status,
      ownsBooking
    });
  } catch (err) {
    console.error("Error checking review status:", err);
    res.status(500).json({ error: "Failed to check review status" });
  }
}
