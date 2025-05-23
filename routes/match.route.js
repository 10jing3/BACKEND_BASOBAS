import express from "express";
import {
  getRoommateMatches,
  matchRoommates,
} from "../controllers/roommate.controller.js";
import { updateMatchingEnabled } from "../controllers/roommate.controller.js";
import { getMatchingEnabled } from "../controllers/roommate.controller.js";


const router = express.Router();

router.get("/", (req, res) => {
  res.send("Match API is working!");
});
router.post("/matchmates/:id", matchRoommates);
router.get("/matchmates/:id", getRoommateMatches);
router.patch("/matching-enabled/:id", updateMatchingEnabled);
router.get("/matching-enabled/:id", getMatchingEnabled);


export default router;
