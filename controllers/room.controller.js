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

export const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, size, amenities, description, available, roomImages } =
      req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid room ID" });
    }

    const existingRoom = await Room.findById(id);
    if (!existingRoom) {
      return res.status(404).json({ message: "Room not found" });
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      id,
      {
        name: name || existingRoom.name,
        price: price || existingRoom.price,
        size: size || existingRoom.size,
        amenities: amenities || existingRoom.amenities,
        description: description || existingRoom.description,
        roomImages: roomImages?.length ? roomImages : existingRoom.roomImages, // Preserve existing images if none provided
        available: available !== undefined ? available : existingRoom.available,
      },
      { new: true, runValidators: true }
    );

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
    const {
      name,
      price,
      size,
      amenities,
      description,
      location,
      owner,
      coordinates,
    } = req.body;

    let parsedCoordinates = coordinates;
    if (typeof coordinates === "string") {
      parsedCoordinates = JSON.parse(coordinates);
    }

    const files = req.files;
    const roomImages = files?.roomImages || [];
    const vrImages = files?.vrImages || [];

    // Check if room already exists
    const existingRoom = await Room.findOne({ name });
    if (existingRoom) {
      return res
        .status(400)
        .json({ message: "Room with this name already exists" });
    }

    // Check if normal images are uploaded
    if (!roomImages.length) {
      return res.status(400).json({ message: "No room images uploaded" });
    }

    // Upload roomImages to Cloudinary
    const roomImageUrls = [];
    for (const file of roomImages) {
      const result = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
        { folder: "room_images" }
      );
      roomImageUrls.push(result.secure_url);
    }

    // Upload vrImages to Cloudinary (if provided)
    const vrImageUrls = [];
    for (const file of vrImages) {
      const result = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
        { folder: "vr_room_images" }
      );
      vrImageUrls.push(result.secure_url);
    }

    // Save room to database
    const newRoom = new Room({
      name,
      price,
      size,
      amenities,
      description,
      location,
      coordinates: {
        lat: parsedCoordinates.lat,
        lng: parsedCoordinates.lng,
      },
      roomImages: roomImageUrls,
      VRImages: vrImageUrls,
      owner,
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

export const getRoomsByOwner = async (req, res) => {
  try {
    const ownerId = req.params.ownerId; // Get the ownerId from the request parameters
    const rooms = await Room.find({ owner: ownerId });

    if (!rooms || rooms.length === 0) {
      return res.status(404).json({ message: "No rooms found for this owner" });
    }

    res.status(200).json(rooms); // Send the rooms as a response
  } catch (error) {
    console.error("Error fetching rooms by owner:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
