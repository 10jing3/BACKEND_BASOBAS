import Room from "../models/room.model.js";
import mongoose from "mongoose";
import cloudinary from "./../config/cloudinary.config.js";

export const createRoom = async (req, res) => {
  try {
    const { name, price, size, amenities, description, roomImage } = req.body;

    // Check if the room already exists
    const existingRoom = await Room.findOne({ name });
    if (existingRoom) {
      return res
        .status(400)
        .json({ message: "Room with this name already exists" });
    }

    // Create a new room
    const newRoom = new Room({
      name,
      price,
      size,
      amenities,
      description,
      roomImage,
    });

    // Save the room to the database
    await newRoom.save();

    res
      .status(201)
      .json({ message: "Room created successfully", room: newRoom });
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update a room
export const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, size, amenities, description, roomImage, available } =
      req.body;

    // Validate the room ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid room ID" });
    }

    // Find the room by ID and update it
    const updatedRoom = await Room.findByIdAndUpdate(
      id,
      { name, price, size, amenities, description, roomImage, available },
      { new: true } // Return the updated room
    );

    if (!updatedRoom) {
      return res.status(404).json({ message: "Room not found" });
    }

    res
      .status(200)
      .json({ message: "Room updated successfully", room: updatedRoom });
  } catch (error) {
    console.error("Error updating room:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a room
export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the room ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid room ID" });
    }

    // Find the room by ID and delete it
    const deletedRoom = await Room.findByIdAndDelete(id);

    if (!deletedRoom) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error("Error deleting room:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all rooms
export const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.status(200).json(rooms);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get a single room by ID
export const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the room ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid room ID" });
    }

    // Find the room by ID
    const room = await Room.findById(id);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json(room);
  } catch (error) {
    console.error("Error fetching room:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createRooms = async (req, res) => {
  try {
    const { name, price, size, amenities, description } = req.body;
    const files = req.files;

    // Check if room already exists
    const existingRoom = await Room.findOne({ name });
    if (existingRoom) {
      return res
        .status(400)
        .json({ message: "Room with this name already exists" });
    }

    // Check if files are uploaded
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    // Upload images to Cloudinary
    const imageUrls = [];
    for (const file of files) {
      const result = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
        {
          folder: "room_images",
        }
      );
      imageUrls.push(result.secure_url);
    }

    // Save room to database
    const newRoom = new Room({
      name,
      price,
      size,
      amenities,
      description,
      roomImages: imageUrls, // Use "roomImages" for multiple images
    });

    await newRoom.save();

    res
      .status(201)
      .json({ message: "Room created successfully", room: newRoom });
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
