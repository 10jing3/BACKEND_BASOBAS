import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default:
        "https://img.freepik.com/premium-vector/man-avatar-profile-picture-vector-illustration_268834-538.jpg",
    },
    phone:{
      type:String
    },
    role: {
      type: String,
      default: "user",
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    age: {
      type: Number,
      min: 18,
      max: 100,
    },
    matchingEnabled: { type: Boolean, default: true },
    budget: {
      type: Number,
    },
    cleanliness: {
      type: Number,
      min: 1,
      max: 10,
    },
    isSmoker: {
      type: Boolean,
      default: false,
    },
    isPetFriendly: {
      type: Boolean,
      default: false,
    },
    wakeUpTime: {
      type: String,
    },
    sleepTime: {
      type: String,
    },
    preferredRoommateGender: {
      type: String,
      enum: ["male", "female", "any"],
      default: "any",
    },
    hobbies: {
      type: [String],
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
