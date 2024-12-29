import express from "express";
import { registerUser, googleAuth } from "../controller/auth.controller.js";

const router = express.Router();

// Register a new user
router.post("/signup", registerUser);

// Authenticate a user with Google
router.post("/google-auth", googleAuth);

export default router;
