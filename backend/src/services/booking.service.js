import db from "../config/database.js";

/**
 * Create a booking offer (guide creates)
 * Sets guide_confirmed = TRUE, lets trigger handle agreed
 */
export async function createBookingOffer(data, guideId) {
  const { request_id, date, price, hours } = data;

  // Check if guide already has a confirmed booking on this date
  const conflictCheck = await db.query(
    `SELECT booking_id, status 
     FROM booking 
     WHERE guide_id = $1 
       AND date = $2 
       AND status = 'confirmed'
     LIMIT 1`,
    [guideId, date]
  );

  if (conflictCheck.rows.length > 0) {
    const error = new Error('You already have a confirmed booking on this date');
    error.statusCode = 409; // Conflict
    throw error;
  }

  const query = `
    INSERT INTO booking (
      guide_id, 
      request_id, 
      date, 
      price, 
      hours, 
      guide_confirmed, 
      traveller_confirmed
    )
    VALUES ($1, $2, $3, $4, $5, TRUE, FALSE)
    RETURNING *
  `;

  const values = [guideId, request_id, date, price, hours];
  const result = await db.query(query, values);

  // Track in guide_offer table (guide_offer is now a join between guide and booking)
  const bookingId = result.rows[0].booking_id;
  await db.query(
    `INSERT INTO guide_offer (guide_id, booking_id, created_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (guide_id, booking_id) DO NOTHING`,
    [guideId, bookingId]
  );

  return result.rows[0];
}

/**
 * Accept a booking offer (traveller accepts)
 * Sets traveller_confirmed = TRUE, trigger will set agreed = TRUE
 */
export async function acceptBookingOffer(bookingId) {
  const query = `
    UPDATE booking
    SET traveller_confirmed = TRUE
    WHERE booking_id = $1
    RETURNING *
  `;

  const result = await db.query(query, [bookingId]);
  return result.rows[0];
}

/**
 * Decline a booking offer (traveller declines)
 * Sets status = 'cancelled'
 */
export async function declineBookingOffer(bookingId) {
  const query = `
    UPDATE booking
    SET status = 'cancelled'
    WHERE booking_id = $1
    RETURNING *
  `;

  const result = await db.query(query, [bookingId]);
  return result.rows[0];
}

/**
 * Get open requests (requests without agreed bookings)
 * For guides to browse available requests
 */
export async function getOpenRequests(filters = {}) {
  const { country, city, interests } = filters;
  const values = [];
  let paramCount = 0;

  let query = `
    SELECT r.*, u.name as user_name, u.user_id
    FROM request r
    JOIN user_does_request udr ON r.RFG_id = udr.request_id
    JOIN users u ON udr.user_id = u.user_id
    WHERE r.date_to >= CURRENT_DATE
      AND NOT EXISTS (
        SELECT 1 FROM booking b
        WHERE b.request_id = r.RFG_id
          AND b.agreed = TRUE
      )
  `;

  // Add optional filters
  if (country) {
    paramCount++;
    query += ` AND r.country ILIKE $${paramCount}`;
    values.push(`%${country}%`);
  }

  if (city) {
    paramCount++;
    query += ` AND r.city ILIKE $${paramCount}`;
    values.push(`%${city}%`);
  }

  if (interests) {
    paramCount++;
    query += ` AND r.interests ILIKE $${paramCount}`;
    values.push(`%${interests}%`);
  }

  query += ` ORDER BY r.created_at DESC`;

  const result = await db.query(query, values);
  return result.rows;
}

/**
 * Get all booking offers for a specific request
 */
export async function getBookingsByRequest(requestId) {
  const query = `
    SELECT 
      b.*, 
      g.city as guide_city,
      g.country as guide_country,
      g.bio,
      g.img_url as guide_img_url,
      g.rating_avg,
      u.name as guide_name,
      u.email as guide_email
    FROM booking b
    JOIN guides g ON b.guide_id = g.guide_id
    JOIN users u ON g.guide_id = u.user_id
    WHERE b.request_id = $1
    ORDER BY b.created_at DESC
  `;

  const result = await db.query(query, [requestId]);
  return result.rows;
}

/**
 * Get a specific booking by ID with details
 */
export async function getBookingById(bookingId) {
  const query = `
    SELECT 
      b.*, 
      g.city as guide_city,
      g.country as guide_country,
      g.bio,
      g.img_url as guide_img_url,
      g.rating_avg,
      u.name as guide_name,
      u.email as guide_email,
      r.title as request_title,
      r.city as request_city,
      r.country as request_country
    FROM booking b
    JOIN guides g ON b.guide_id = g.guide_id
    JOIN users u ON g.guide_id = u.user_id
    JOIN request r ON b.request_id = r.RFG_id
    WHERE b.booking_id = $1
  `;

  const result = await db.query(query, [bookingId]);
  return result.rows[0];
}

/**
 * Get all bookings for a specific guide
 */
export async function getBookingsByGuide(guideId) {
  const query = `
    SELECT 
      b.*, 
      r.title as request_title,
      r.city as request_city,
      r.country as request_country,
      r.date_from,
      r.date_to,
      u.name as traveller_name
    FROM booking b
    JOIN request r ON b.request_id = r.RFG_id
    JOIN user_does_request udr ON r.RFG_id = udr.request_id
    JOIN users u ON udr.user_id = u.user_id
    WHERE b.guide_id = $1
    ORDER BY b.created_at DESC
  `;

  const result = await db.query(query, [guideId]);
  return result.rows;
}

/**
 * Get all bookings for a traveller (via their requests)
 */
export async function getBookingsByTraveller(userId) {
  const query = `
    SELECT 
      b.*, 
      r.title as request_title,
      r.city as request_city,
      r.country as request_country,
      g.img_url as guide_img_url,
      g.bio as guide_bio,
      g.city as guide_city,
      g.country as guide_country,
      g.rating_avg,
      g.languages,
      u.name as guide_name,
      u.email as guide_email
    FROM booking b
    JOIN request r ON b.request_id = r.RFG_id
    JOIN user_does_request udr ON r.RFG_id = udr.request_id
    JOIN guides g ON b.guide_id = g.guide_id
    JOIN users u ON g.guide_id = u.user_id
    WHERE udr.user_id = $1
    ORDER BY b.date DESC
  `;

  const result = await db.query(query, [userId]);
  return result.rows;
}

/**
 * Get all booked dates for a specific request (confirmed bookings by any guide)
 * Used to disable dates in the booking offer form
 */
export async function getRequestBookedDates(requestId) {
  const query = `
    SELECT DISTINCT TO_CHAR(date, 'YYYY-MM-DD') as date_str
    FROM booking
    WHERE request_id = $1
      AND status = 'confirmed'
    ORDER BY date_str ASC
  `;

  const result = await db.query(query, [requestId]);
  // Return array of date strings - already formatted by PostgreSQL
  return result.rows.map(row => row.date_str);
}

