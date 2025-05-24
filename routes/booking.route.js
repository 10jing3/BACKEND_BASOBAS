import express from "express";
import {
  createBookingRequest,
  getOwnerRequests,
  acceptBooking,
  declineBooking,
  getUserRequests,
} from "../controllers/booking.controller.js";

const router = express.Router();

router.post("/request", createBookingRequest);
router.get("/owner-requests", getOwnerRequests);
router.post("/accept/:id", acceptBooking);
router.post("/decline/:id", declineBooking);
router.get("/my-requests", getUserRequests);

export default router;