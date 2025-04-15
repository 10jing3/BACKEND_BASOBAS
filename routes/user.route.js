import express from "express";
import {
  test,
  updateUser,
  deleteUser,
  getAllUser,
  getUserById,
} from "../controllers/user.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.get("/", test).post("/update/:id", verifyToken, updateUser).delete("/delete/:id", verifyToken, deleteUser).get("/getall", getAllUser).get("/getbyid/:id",getUserById)

export default router;
