import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      
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
    documentImages: {
      type: [String],
    },
    description: {
      type: String,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['single room', 'two room', '2 BHK', '3 BHK', '4 BHK', 'flat', 'house'],
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
      enum: ['1', '2', '3', '4+'],
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
      enum: ['yes', 'no'], 
      default: 'no'
    },
    balcony: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no'
    },
    status: {
  type: String,
  enum: ["pending", "approved", "rejected"],
  default: "pending"
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
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review"
      }
    ]  
  },
  { timestamps: true }
);

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    username: {
      type: String,
    },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    comment: {
      type: String,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);



const Review = mongoose.model("Review", reviewSchema)
const Room = mongoose.model("Room", roomSchema);

export default Room;
export { Review};
