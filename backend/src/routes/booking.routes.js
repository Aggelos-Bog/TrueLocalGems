import express from "express";
import {
  createOffer,
  acceptOffer,
  declineOffer,
  getOpenRequests,
  getRequestOffers,
  getOfferDetails,
  getMyBookings,
  getRequestBookedDates,
} from "../controllers/booking.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.post("/", authenticateToken, createOffer);
router.patch("/:id/accept", authenticateToken, acceptOffer);
router.patch("/:id/decline", authenticateToken, declineOffer);
router.get("/open-requests", authenticateToken, getOpenRequests);
router.get("/booked-dates", authenticateToken, getRequestBookedDates);
router.get("/my-bookings", authenticateToken, getMyBookings);
router.get("/request/:request_id", authenticateToken, getRequestOffers);
router.get("/:id", authenticateToken, getOfferDetails);

export default router;
