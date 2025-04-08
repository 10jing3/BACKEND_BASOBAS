import express from "express";
import {
  createRoom,
  updateRoom,
  deleteRoom,
  getAllRooms,
  getRoomById,
  createRooms,
  getRoomsByOwner,
} from "../controllers/room.controller.js";
import multer from "multer";

const storage = multer.memoryStorage({});

const upload = multer({
  storage,
});

const router = express.Router();

router.post("/rooms", createRoom);
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
  .get("/get-room-by-owner/:ownerId", getRoomsByOwner);

export default router;
