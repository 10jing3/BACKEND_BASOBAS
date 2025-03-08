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
      type: String,
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
    description: {
      type: String,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true, // Ensure that an owner is always specified
    },
  },
  { timestamps: true }
);

const Room = mongoose.model("Room", roomSchema);

export default Room;
