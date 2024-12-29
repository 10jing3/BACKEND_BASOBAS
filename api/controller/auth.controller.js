import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

// Register a new user with username and password
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  // Validate request body
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the new user
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({
      message: "User registered successfully.",
      user: { id: newUser._id, name: newUser.name, email: newUser.email },
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Server error during registration.", error: error.message });
  }
};

// Google Authentication
export const googleAuth = async (req, res) => {
  const { name, email, googleId } = req.body;

  // Validate request body
  if (!name || !email || !googleId) {
    return res.status(400).json({ message: "Invalid request. Missing required fields." });
  }

  try {
    // Check if the user already exists
    let user = await User.findOne({ email });
    if (!user) {
      // Create a new user for Google authentication
      user = new User({ name, email, googleId });
      await user.save();
    }

    res.status(200).json({
      message: "User authenticated successfully.",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Error during Google authentication:", error);
    res.status(500).json({ message: "Server error during Google authentication.", error: error.message });
  }
};
