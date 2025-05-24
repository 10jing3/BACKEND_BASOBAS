import Booking from "../models/booking.model.js";
import Room from "../models/room.model.js";

// Create a booking request (user -> owner)
export const createBookingRequest = async (req, res, next) => {
  try {
    const { roomId, userId } = req.body;
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    // Prevent duplicate pending requests
    const existing = await Booking.findOne({
      room: roomId,
      user: userId,
      status: "pending",
      paymentStatus: "pending",
    });
    if (existing)
      return res
        .status(400)
        .json({ message: "You already have a pending request for this room." });

    const booking = new Booking({
      room: roomId,
      user: userId,
      owner: room.owner,
      status: "pending",
      paymentStatus: "pending",
    });
    await booking.save();
    res.status(201).json({ message: "Booking request sent!", booking });
  } catch (err) {
  console.error("Error in createBookingRequest:", err);
  next(err);
}
};

// Get all booking requests for owner (dashboard)
export const getOwnerRequests = async (req, res, next) => {
  try {
    const { ownerId } = req.query;
    if (!ownerId) return res.status(400).json({ message: "ownerId is required" });

    // Only show bookings that are pending and not paid/cancelled
    const bookings = await Booking.find({
      owner: ownerId,
      paymentStatus: "pending",
      status: "pending",
    })
      .populate("user", "username email phone age") // only necessary fields
      .populate("room"); // populate room name
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

// Get user's own booking requests
export const getUserRequests = async (req, res, next) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: "userId is required" });

    const bookings = await Booking.find({ user: userId });
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

// Accept a booking request
export const acceptBooking = async (req, res, next) => {
  try {
    const { ownerId } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.owner.toString() !== ownerId)
      return res.status(403).json({ message: "Not authorized" });

    booking.status = "accepted";
    await booking.save();
    res.json({ message: "Booking accepted", booking });
  } catch (err) {
    next(err);
  }
};

// Decline a booking request
export const declineBooking = async (req, res, next) => {
  try {
    const { ownerId } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.owner.toString() !== ownerId)
      return res.status(403).json({ message: "Not authorized" });

    booking.status = "declined";
    booking.paymentStatus = "cancelled";
    await booking.save();
    res.json({ message: "Booking declined", booking });
  } catch (err) {
    next(err);
  }
};

