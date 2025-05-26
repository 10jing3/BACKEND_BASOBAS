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
  deleteRoomImages,
  getAllRoomsAdmin,
  getRoomsOwnedAndBooked,
  removeBooking,
  getPendingRooms,
  approveRoom,
  rejectRoom,
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
  router.post(
    "/upload",
    upload.fields([
      { name: "roomImages", maxCount: 5 },
      { name: "vrImages", maxCount: 5 },
  { name: 'documentImages', maxCount: 10 }
    ]),
    createRooms
  );
  router.get("/get-room-by-owner/:ownerId", getRoomsByOwner);
  router.get("/search", SearchRoom);
  router.put("/update-status/:id/:userId", updateRoomStatus);
  router.get("/getbooked/:userId", getRoomsBookedByUser);
  router.get("/getreviews/:roomId", getRoomReviews);
  router.post("/createreview/:roomId", createReview);
  router.post("/delete-images/:id", deleteRoomImages);
  router.get('/owned/bookings/:ownerId', getRoomsOwnedAndBooked);
  router.patch("/remove-booking/:bookingId", removeBooking);
  router.get("/admin/rooms", getAllRoomsAdmin);
 // Get all pending rooms (for admin approval)
router.get("/pending", getPendingRooms);

// Approve a room
router.patch("/approve/:id", approveRoom);

// Reject (delete) a room
router.delete("/reject/:id", rejectRoom);

export default router;
