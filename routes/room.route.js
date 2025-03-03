import express from "express";
import {
  updateRoom,
  deleteRoom,
  getAllRooms,
  getRoomById,
  createRooms,
} from "../controllers/room.controller.js";
import multer from "multer";

const storage = multer.memoryStorage({});

const upload = multer({
  storage,
});

const router = express.Router();

router.post("/rooms", createRooms);
router.put("/rooms/:id", updateRoom);
router.delete("/rooms/:id", deleteRoom);
router.get("/rooms", getAllRooms);
router.get("/rooms/:id", getRoomById);
router.post("/upload", upload.array("roomImages", 5), createRooms);

export default router;
