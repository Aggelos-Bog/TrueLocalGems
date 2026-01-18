import db from "../config/database.js";

/**
 * Create a new review for a booking
 * @param {number} userId - ID of the user creating the review
 * @param {number} bookingId - ID of the booking being reviewed
 * @param {number} rating - Rating value (0-5)
 * @param {string} reviewText - Review text content
 * @returns {Promise<Object>} Created review object
 */
export async function createReview(userId, bookingId, rating, reviewText) {
  // First, verify the booking exists and is completed
  const bookingCheck = await db.query(
    `SELECT b.booking_id, b.status, b.request_id, b.guide_id
     FROM booking b
     WHERE b.booking_id = $1`,
    [bookingId]
  );

  if (bookingCheck.rows.length === 0) {
    const error = new Error("Booking not found");
    error.statusCode = 404;
    throw error;
  }

  const booking = bookingCheck.rows[0];

  // Check if booking is completed
  if (booking.status !== 'completed') {
    const error = new Error("Can only review completed bookings");
    error.statusCode = 400;
    throw error;
  }

  // Verify user owns the request associated with this booking
  const ownerCheck = await db.query(
    `SELECT user_id FROM user_does_request WHERE request_id = $1 AND user_id = $2`,
    [booking.request_id, userId]
  );

  if (ownerCheck.rows.length === 0) {
    const error = new Error("Unauthorized: You don't own this booking's request");
    error.statusCode = 403;
    throw error;
  }

  // Check if review already exists
  const existingReview = await db.query(
    `SELECT review_id FROM review WHERE user_id = $1 AND booking_id = $2`,
    [userId, bookingId]
  );

  if (existingReview.rows.length > 0) {
    const error = new Error("You have already reviewed this booking");
    error.statusCode = 409;
    throw error;
  }

  // Create the review
  const result = await db.query(
    `INSERT INTO review (user_id, booking_id, rating, review_text)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [userId, bookingId, rating, reviewText || null]
  );

  return result.rows[0];
}

/**
 * Get all reviews for a specific guide
 * @param {number} guideId - ID of the guide
 * @returns {Promise<Array>} Array of review objects with reviewer details
 */
export async function getReviewsByGuide(guideId) {
  console.log('[getReviewsByGuide] Called with guideId:', guideId, 'Type:', typeof guideId);
  
  const query = `
    SELECT 
      r.review_id,
      r.rating,
      r.review_text,
      r.created_at,
      r.booking_id,
      u.user_id,
      u.name as reviewer_name,
      b.date as booking_date
    FROM review r
    JOIN booking b ON r.booking_id = b.booking_id
    JOIN users u ON r.user_id = u.user_id
    WHERE b.guide_id = $1
    ORDER BY r.created_at DESC
  `;

  console.log('[getReviewsByGuide] Executing query with param:', guideId);
  const result = await db.query(query, [guideId]);
  console.log('[getReviewsByGuide] Result rows:', result.rows.length, 'rows');
  console.log('[getReviewsByGuide] Data:', JSON.stringify(result.rows, null, 2));
  
  return result.rows;
}

/**
 * Check if a review exists for a specific user and booking
 * @param {number} userId - ID of the user
 * @param {number} bookingId - ID of the booking
 * @returns {Promise<boolean>} True if review exists, false otherwise
 */
export async function checkReviewExists(userId, bookingId) {
  const result = await db.query(
    `SELECT 1 FROM review WHERE user_id = $1 AND booking_id = $2`,
    [userId, bookingId]
  );
  return result.rows.length > 0;
}

/**
 * Get a specific review by user and booking
 * @param {number} userId - ID of the user
 * @param {number} bookingId - ID of the booking
 * @returns {Promise<Object|null>} Review object or null if not found
 */
export async function getReviewByUserAndBooking(userId, bookingId) {
  const result = await db.query(
    `SELECT * FROM review WHERE user_id = $1 AND booking_id = $2`,
    [userId, bookingId]
  );
  return result.rows[0] || null;
}
