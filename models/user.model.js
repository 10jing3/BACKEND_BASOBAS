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
    budget: {
      type: Number,
    },
    cleanliness: {
      type: Number,
      min: 1,
      max: 5,
    },
    isSmoker: {
      type: Boolean,
    },
    isPetFriendly: {
      type: Boolean,
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
