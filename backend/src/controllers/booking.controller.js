import * as bookingService from "../services/booking.service.js";
import db from "../config/database.js";

/**
 * Create a booking offer (guide only)
 */
export async function createOffer(req, res) {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Only guides can create offers
    if (userRole !== 1) {
      return res.status(403).json({ error: "Only guides can create booking offers" });
    }

    const { request_id, date, price, hours } = req.body;

    // Validate required fields
    if (!request_id || !date || !price || !hours) {
      return res.status(400).json({ error: "Missing required fields: request_id, date, price, hours" });
    }

    // Validate positive numbers
    if (price <= 0 || hours <= 0) {
      return res.status(400).json({ error: "Price and hours must be positive" });
    }

    // Create the offer
    const booking = await bookingService.createBookingOffer(
      { request_id, date, price, hours },
      userId
    );

    res.status(201).json(booking);
  } catch (err) {
    console.error("Error creating booking offer:", err);
    
    // Handle date conflict error
    if (err.statusCode === 409) {
      return res.status(409).json({ error: err.message });
    }
    
    res.status(500).json({ error: "Failed to create booking offer" });
  }
}

/**
 * Accept a booking offer (traveller only)
 */
export async function acceptOffer(req, res) {
  try {
    const userId = req.user.id;
    const { id: bookingId } = req.params;

    // Get the booking
    const booking = await bookingService.getBookingById(bookingId);

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Check if user owns the request
    const ownerResult = await db.query(
      "SELECT user_id FROM user_does_request WHERE request_id = $1",
      [booking.request_id]
    );

    if (ownerResult.rows.length === 0 || ownerResult.rows[0].user_id !== userId) {
      return res.status(403).json({ error: "Unauthorized: You don't own this request" });
    }

    // Check if already in terminal state
    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return res.status(400).json({ error: `Cannot accept booking with status: ${booking.status}` });
    }

    // Accept the offer
    const updatedBooking = await bookingService.acceptBookingOffer(bookingId);

    res.status(200).json(updatedBooking);
  } catch (err) {
    console.error("Error accepting booking offer:", err);
    res.status(500).json({ error: "Failed to accept booking offer" });
  }
}

/**
 * Decline a booking offer (traveller only)
 */
export async function declineOffer(req, res) {
  try {
    const userId = req.user.id;
    const { id: bookingId } = req.params;

    // Get the booking
    const booking = await bookingService.getBookingById(bookingId);

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Check if user owns the request
    const ownerResult = await db.query(
      "SELECT user_id FROM user_does_request WHERE request_id = $1",
      [booking.request_id]
    );

    if (ownerResult.rows.length === 0 || ownerResult.rows[0].user_id !== userId) {
      return res.status(403).json({ error: "Unauthorized: You don't own this request" });
    }

    // Decline the offer
    const updatedBooking = await bookingService.declineBookingOffer(bookingId);

    res.status(200).json(updatedBooking);
  } catch (err) {
    console.error("Error declining booking offer:", err);
    res.status(500).json({ error: "Failed to decline booking offer" });
  }
}

/**
 * Get open requests (guide only)
 */
export async function getOpenRequests(req, res) {
  try {
    const userRole = req.user.role;

    // Only guides can view open requests
    if (userRole !== 1) {
      return res.status(403).json({ error: "Only guides can view open requests" });
    }

    const { country, city, interests } = req.query;
    const filters = { country, city, interests };

    const requests = await bookingService.getOpenRequests(filters);

    res.status(200).json(requests);
  } catch (err) {
    console.error("Error fetching open requests:", err);
    res.status(500).json({ error: "Failed to fetch open requests" });
  }
}

/**
 * Get all offers for a specific request
 */
export async function getRequestOffers(req, res) {
  try {
    const userId = req.user.id;
    const { request_id } = req.params;

    // Check if user owns the request OR is one of the guides who made an offer
    const ownerResult = await db.query(
      "SELECT user_id FROM user_does_request WHERE request_id = $1",
      [request_id]
    );

    const isOwner = ownerResult.rows.length > 0 && ownerResult.rows[0].user_id === userId;

    if (!isOwner) {
      // Check if user is a guide who made an offer
      const guideOfferResult = await db.query(
        "SELECT 1 FROM booking WHERE request_id = $1 AND guide_id = $2",
        [request_id, userId]
      );

      if (guideOfferResult.rows.length === 0) {
        return res.status(403).json({ error: "Unauthorized" });
      }
    }

    const bookings = await bookingService.getBookingsByRequest(request_id);

    res.status(200).json(bookings);
  } catch (err) {
    console.error("Error fetching request offers:", err);
    res.status(500).json({ error: "Failed to fetch request offers" });
  }
}

/**
 * Get specific booking details
 */
export async function getOfferDetails(req, res) {
  try {
    const userId = req.user.id;
    const { id: bookingId } = req.params;

    const booking = await bookingService.getBookingById(bookingId);

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Check if user is the guide OR owns the request
    const isGuide = booking.guide_id === userId;

    const ownerResult = await db.query(
      "SELECT user_id FROM user_does_request WHERE request_id = $1",
      [booking.request_id]
    );

    const isOwner = ownerResult.rows.length > 0 && ownerResult.rows[0].user_id === userId;

    if (!isGuide && !isOwner) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    res.status(200).json(booking);
  } catch (err) {
    console.error("Error fetching booking details:", err);
    res.status(500).json({ error: "Failed to fetch booking details" });
  }
}

/**
 * Get all bookings for authenticated user
 */
export async function getMyBookings(req, res) {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let bookings;

    if (userRole === 1) {
      // Guide: get bookings where they are the guide
      bookings = await bookingService.getBookingsByGuide(userId);
    } else {
      // Traveller: get bookings for their requests
      bookings = await bookingService.getBookingsByTraveller(userId);
    }

    res.status(200).json(bookings);
  } catch (err) {
    console.error("Error fetching my bookings:", err);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
}

/**
 * Get all booked dates for a specific request
 * Used by guides to see which dates are unavailable
 */
export async function getRequestBookedDates(req, res) {
  try {
    const { request_id } = req.query;

    if (!request_id) {
      return res.status(400).json({ error: "request_id is required" });
    }

    const bookedDates = await bookingService.getRequestBookedDates(request_id);

    res.status(200).json({ bookedDates });
  } catch (err) {
    console.error("Error fetching booked dates:", err);
    res.status(500).json({ error: "Failed to fetch booked dates" });
  }
}
