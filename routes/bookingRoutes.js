import express from "express";
import {
  createBooking,
  getUserBookings,
} from "../controllers/bookingController.js";

import { isAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/bookings", isAuthenticated, createBooking);
router.get("/mybookings", isAuthenticated, getUserBookings);

export default router;
