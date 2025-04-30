import express from "express";
import {
  updateRoom,
  deleteRoom,
  getAllRooms,
  getRoomById,
  createRooms,
  getRoomsByOwner,
  SearchRoom,
  updateRoomStatus,
  getRoomsBookedByUser,
  createReview,
  getRoomReviews,
} from "../controllers/room.controller.js";
import multer from "multer";

const storage = multer.memoryStorage({});

const upload = multer({
  storage,
});

const router = express.Router();

router.put(
  "/updateroom/:id",
  upload.fields([
    { name: "roomImages", maxCount: 5 },
    { name: "vrImages", maxCount: 5 },
  ]),
  updateRoom
);
router.delete("/rooms/:id", deleteRoom);
router.get("/rooms", getAllRooms);
router.get("/rooms/:id", getRoomById);
router
  .post(
    "/upload",
    upload.fields([
      { name: "roomImages", maxCount: 5 },
      { name: "vrImages", maxCount: 5 },
    ]),
    createRooms
  )
  .get("/get-room-by-owner/:ownerId", getRoomsByOwner)
  .get("/search", SearchRoom)
  .put("/update-status/:id/:userId", updateRoomStatus)
  .get("/getbooked/:userId", getRoomsBookedByUser)
  .get("/getreviews/:roomId", getRoomReviews).post("/createreview/:roomId", createReview)

export default router;
