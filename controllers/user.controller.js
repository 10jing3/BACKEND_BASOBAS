import User from "../models/user.model.js";
import Room from "../models/room.model.js"
import { errorHandler } from "../utils/error.js";
import bcryptjs from "bcryptjs";
import mongoose from "mongoose";

export const test = (req, res) => {
  res.json({
    message: "API is working!",
  });
};

export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(errorHandler(401, "You can update only your account!"));
  }

  try {
    if (req.body.password) {
      req.body.password = bcryptjs.hashSync(req.body.password, 10);
    }

    const updateFields = {
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      profilePicture: req.body.profilePicture,
      phone: req.body.phone,
      gender: req.body.gender,
      age: req.body.age,
      budget: req.body.budget,
      cleanliness: req.body.cleanliness,
      isSmoker: req.body.isSmoker,
      isPetFriendly: req.body.isPetFriendly,
      wakeUpTime: req.body.wakeUpTime,
      sleepTime: req.body.sleepTime,
      preferredRoommateGender: req.body.preferredRoommateGender,
      hobbies: req.body.hobbies,
    };

    Object.keys(updateFields).forEach(
      (key) => updateFields[key] === undefined && delete updateFields[key]
    );

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );

    const { password, ...rest } = updatedUser._doc;
    res.status(200).json({ success: true, user: rest });
  } catch (error) {
    next(error);
  }
};



export const deleteUser = async (req, res) => {
  try {
    const userIdToDelete = req.params.id;

    // Authorization check
    if (req.user.id !== userIdToDelete && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this account." });
    }

    const deletedUser = await User.findByIdAndDelete(userIdToDelete);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Delete all rooms where owner = userIdToDelete
    await Room.deleteMany({ owner: userIdToDelete });

    res
      .status(200)
      .json({ message: "User and their uploaded rooms have been deleted." });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting user and their rooms",
      error: error.message,
    });
  }
};

export const getAllUser = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};


export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const { password, ...rest } = user._doc;
    res.status(200).json(rest);
    return user;
  } catch (error) {
    next(error);
  }
};

export const getUserName = async (_id) =>{
  return User.findById(_id)
    .then((user) => {
      if (!user) {
        throw new Error("User not found");
      }
      return user.username;
    })
    .catch((error) => {
      throw error;
    });
} 