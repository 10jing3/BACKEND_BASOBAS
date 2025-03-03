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
    },
    roomImages: {
      type: [String],
    },
    description: {
      type: String,
    },
    roomCategory: {
      type: String,
    },
    contactNumber: {
      type: String,
    },
  },
  { timestamps: true }
);

const Room = mongoose.model("Room", roomSchema);

export default Room;
