import express from "express";
import {
  getRoommateMatches,
  matchRoommates,
} from "../controllers/roommate.controller.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Match API is working!");
});
router.get("/matchroommates/:id", matchRoommates);
router.get("/matchmates/:id", getRoommateMatches);

export default router;
