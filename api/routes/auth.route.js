import express from "express";
import { signup } from "../controller/auth.controller.js"; // Add `.js` if using ES Modules

const router = express.Router();

router.post("/signup", signup);

export default router;
