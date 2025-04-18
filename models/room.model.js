import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    price: {
      type: Number,
    },
    size: {
      type: String,
    },
    amenities: {
      type: [String],
    },
    available: {
      type: Boolean,
      default: true,
    },
    roomImage: {
      type: String,
    },
    location: {
      type: String,
      trim: true,
    },
    coordinates: {
      type: {
        lat: Number,
        lng: Number,
      },
      default: { lat: 0, lng: 0 },
    },
    roomImages: {
      type: [String],
    },
    vrImages: {
      type: [String],
    },
    description: {
      type: String,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['single room', 'two room', '2 BHK', '4 BHK', 'flat', 'house'],
        message: 'Please select a valid category'
      }
    },
    bedrooms: {
      type: String,
      enum: ['1', '2', '3', '4+'],
      default: '1'
    },
    bathrooms: {
      type: String,
      enum: ['1', '2', '3'],
      default: '1'
    },
    kitchen: {
      type: String,
      enum: ['modular', 'semi-modular', 'standard', 'none'],
      default: 'standard'
    },
    faced: {
      type: String,
      enum: ['north', 'south', 'east', 'west'],
      default: 'north'
    },
    parking: {
      type: String,
      enum: ['yes', 'no', 'covered', 'open'],
      default: 'no'
    },
    balcony: {
      type: String,
      enum: ['yes', 'no', '1', '2'],
      default: 'no'
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true, // Ensure that an owner is always specified
    },
    bookings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
      },

    ],
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
const Room = mongoose.model("Room", roomSchema);

export default Room;
export { Booking };
