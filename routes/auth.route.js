import express from "express";
import { registerUser, loginUser, googleAuth } from "../controller/auth.controller.js";

const router = express.Router();

// Register a new user
router.post("/signup", registerUser);

// Login a user with name and password
router.post("/signin", loginUser);

// Authenticate a user with Google
router.post("/google-auth", googleAuth);

export default router;
