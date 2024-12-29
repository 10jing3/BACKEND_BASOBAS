import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, trim: true }, // Optional for Google users
  googleId: { type: String, trim: true }, // For Google-authenticated users
});

const User = mongoose.model("User", userSchema);

export default User;
