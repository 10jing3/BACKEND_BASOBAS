import Booking from "../models/booking.model.js";
import Room from "../models/room.model.js";
import transporter from "../utils/email.js";
import User from "../models/user.model.js";

export const createBookingRequest = async (req, res, next) => {
  try {
    const { roomId, userId } = req.body;
    if (!roomId || !userId) {
      return res.status(400).json({ message: "roomId and userId are required." });
    }

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    // If the user already has an accepted booking for this room
    const accepted = await Booking.findOne({
      room: roomId,
      user: userId,
      status: "accepted",
      paymentStatus: { $ne: "cancelled" },
    });
    if (accepted) {
      console.warn("User already has an accepted booking:", accepted);
      return res.status(400).json({
        message:
          "You already have an accepted booking for this room. Please go to 'My Bookings' in your dashboard for further process.",
        booking: accepted,
      });
    }

    // Prevent duplicate pending requests
    const existing = await Booking.findOne({
      room: roomId,
      user: userId,
      status: "pending",
      paymentStatus: "pending",
    });
    if (existing) {
      console.warn("User already has a pending booking request:", existing);
      return res.status(400).json({
        message: "You already have a pending request for this room.",
        booking: existing,
      });
    }

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
    res.status(500).json({ message: "Internal server error" });
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

    const bookings = await Booking.find({ user: userId })
      .populate("room")
      .populate("owner", "username phone email");
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};


// Accept a booking request
export const acceptBooking = async (req, res, next) => {
  try {
    const { ownerId } = req.body;
    const booking = await Booking.findById(req.params.id).populate("user").populate("room");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.owner.toString() !== ownerId)
      return res.status(403).json({ message: "Not authorized" });

    booking.status = "accepted";
    await booking.save();

    // Send email notification
    if (booking.user?.email) {
      await transporter.sendMail({
        from: "your_email@gmail.com",
        to: booking.user.email,
        subject: "Your Booking Request Was Accepted",
        text: `Hi ${booking.user.name || booking.user.username || "User"},\n\nYour booking request for room "${booking.room.name}" has been accepted!`,
      });
    }

    res.json({ message: "Booking accepted", booking });
  } catch (err) {
    next(err);
  }
};

// Decline a booking request
export const declineBooking = async (req, res, next) => {
  try {
    const { ownerId } = req.body;
    const booking = await Booking.findById(req.params.id).populate("user").populate("room");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.owner.toString() !== ownerId)
      return res.status(403).json({ message: "Not authorized" });

    booking.status = "declined";
    booking.paymentStatus = "cancelled";
    await booking.save();

    // Send email notification
    if (booking.user?.email) {
      await transporter.sendMail({
        from: "your_email@gmail.com",
        to: booking.user.email,
        subject: "Your Booking Request Was Declined",
        text: `Hi ${booking.user.name || booking.user.username || "User"},\n\nYour booking request for room "${booking.room.name}" has been accepted!\n\nPlease go to 'My Bookings' in your dashboard for further process.`,
      });
    }

    res.json({ message: "Booking declined", booking });
  } catch (err) {
    next(err);
  }
};

export const deleteBooking = async (req, res, next) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: "Booking deleted" });
  } catch (err) {
    next(err);
  }
};

export const markBookingPaid = async (req, res) => {
  try {
    const { roomId, userId } = req.body;
    // Find the latest booking for this room and user with pending payment
    const booking = await Booking.findOneAndUpdate(
      { room: roomId, user: userId, paymentStatus: "pending" },
      { paymentStatus: "paid" },
      { new: true }
    );
    if (!booking) {
      return res.status(404).json({ message: "Booking not found or already paid." });
    }

    // Set the room as unavailable after payment
    await Room.findByIdAndUpdate(roomId, { available: false });

    res.json({ message: "Payment status updated to paid.", booking });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

// Get all rooms owned by current user with accepted bookings
export const getOwnerAcceptedRooms = async (req, res) => {
  try {
    const ownerId = req.params.ownerId;
    const rooms = await Room.find({ owner: ownerId });

    // Get all accepted bookings for these rooms
    const acceptedBookings = await Booking.find({
      room: { $in: rooms.map((r) => r._id) },
      status: "accepted",
    })
      .populate("user", "-password")
      .populate("room");

    // Map each room to all its accepted bookings
    const result = rooms.map((room) => {
      const bookings = acceptedBookings
        .filter((b) => b.room._id.toString() === room._id.toString())
        .map((booking) => ({
          _id: booking._id,
          user: booking.user,
          paymentStatus: booking.paymentStatus,
          status: booking.status,
        }));
      return {
        ...room.toObject(),
        bookings, // array of accepted bookings
      };
    });

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch rooms with bookings." });
  }
};