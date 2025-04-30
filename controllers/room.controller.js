import Room, { Review } from "../models/room.model.js";
import mongoose from "mongoose";
import cloudinary from "./../config/cloudinary.config.js";

export const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      price,
      size,
      category,
      bedrooms,
      bathrooms,
      kitchen,
      faced,
      parking,
      balcony,
      amenities,
      description,
      location,
      coordinates,
      available,
      owner,
      keepExistingImages = 'true', // Default to keeping existing images
      keepExistingVRImages = 'true'
    } = req.body;

    const files = req.files || {};
    const newRoomImages = files['roomImages'] || [];
    const newVRImages = files['vrImages'] || [];

    // Validate room ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid room ID format" 
      });
    }

    const existingRoom = await Room.findById(id);
    if (!existingRoom) {
      return res.status(404).json({ 
        success: false,
        message: "Room not found" 
      });
    }

    // Process image uploads (only if new files are provided)
    const uploadToCloudinary = async (file, folder) => {
      const result = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
        { folder }
      );
      return result.secure_url;
    };

    // Only upload new images if provided
    let newRoomImageUrls = [];
    if (newRoomImages.length > 0) {
      newRoomImageUrls = await Promise.all(
        newRoomImages.map(file => uploadToCloudinary(file, "room_images"))
      );
    }

    let newVRImageUrls = [];
    if (newVRImages.length > 0) {
      newVRImageUrls = await Promise.all(
        newVRImages.map(file => uploadToCloudinary(file, "vr_room_images"))
      );
    }

    // Prepare image arrays (keep old unless explicitly replacing)
    const finalRoomImages = [
      ...(keepExistingImages === 'true' ? existingRoom.roomImages : []),
      ...newRoomImageUrls
    ];

    const finalVRImages = [
      ...(keepExistingVRImages === 'true' ? existingRoom.vrImages : []),
      ...newVRImageUrls
    ];

    // Update document
    const updatedRoom = await Room.findByIdAndUpdate(
      id,
      {
        name: name || existingRoom.name,
        price: Number(price) || existingRoom.price,
        size: Number(size) || existingRoom.size,
        category: category || existingRoom.category,
        bedrooms: bedrooms || existingRoom.bedrooms,
        bathrooms: bathrooms || existingRoom.bathrooms,
        kitchen: kitchen || existingRoom.kitchen,
        faced: faced || existingRoom.faced,
        parking: parking || existingRoom.parking,
        balcony: balcony || existingRoom.balcony,
        amenities: Array.isArray(amenities) 
          ? amenities 
          : (amenities ? amenities.split(',').map(item => item.trim()) : existingRoom.amenities),
        description: description || existingRoom.description,
        location: location || existingRoom.location,
        coordinates: coordinates ? {
          lat: parseFloat(coordinates.lat) || existingRoom.coordinates.lat,
          lng: parseFloat(coordinates.lng) || existingRoom.coordinates.lng,
        } : existingRoom.coordinates,
        roomImages: finalRoomImages,
        vrImages: finalVRImages,
        available: available !== undefined ? available === "true" || available === true : existingRoom.available,
        owner: owner ? new mongoose.Types.ObjectId(owner) : existingRoom.owner
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Room updated successfully",
      data: updatedRoom
    });

  } catch (error) {
    console.error("Error in updateRoom:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
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
      category,
      bedrooms,
      bathrooms,
      kitchen,
      faced,
      parking,
      balcony,
      amenities,
      description,
      location,
      coordinates,
      owner
    } = req.body;

    console.log(req.body)
    console.log(req.files)

    // Validate required fields
    const requiredFields = {
      name: "Name",
      price: "Price",
      size: "Size",
      category: "Category",
      bedrooms: "Bedrooms",
      bathrooms: "Bathrooms",
      owner: "Owner"
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([field]) => !req.body[field])
      .map(([_, name]) => name);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        missingFields
      });
    }

    // Validate owner ID
    if (!mongoose.Types.ObjectId.isValid(owner)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid owner ID format" 
      });
    }

    // Parse and validate coordinates
    let parsedCoordinates = { lat: 0, lng: 0 };
    if (coordinates) {
      try {
        parsedCoordinates = typeof coordinates === 'string' 
          ? JSON.parse(coordinates) 
          : coordinates;
        
        if (isNaN(parsedCoordinates.lat)) parsedCoordinates.lat = 0;
        if (isNaN(parsedCoordinates.lng)) parsedCoordinates.lng = 0;
      } catch (error) {
        console.error("Error parsing coordinates:", error);
        // Continue with default coordinates
      }
    }

    // Handle file uploads
    const files = req.files || {};
    const roomImages = files['roomImages'] || [];
    const vrImages = files['vrImages'] || [];
    
    // Validate at least one room image
    if (!roomImages || roomImages.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "At least one room image is required" 
      });
    }
    
    // Upload images to Cloudinary with error handling
    const uploadToCloudinary = async (file, folder) => {
      try {
        const result = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
          { folder }
        );
        return result.secure_url;
      } catch (error) {
        console.error(`Error uploading to ${folder}:`, error);
        throw new Error(`Failed to upload ${folder} image`);
      }
    };
    
    // Process room images
    const roomImageUrls = await Promise.all(
      roomImages.map(file => uploadToCloudinary(file, "room_images"))
    );
    
    // Process VR images (optional)
    let vrImageUrls = [];
    if (vrImages.length > 0) {
      try {
        vrImageUrls = await Promise.all(
          vrImages.map(file => uploadToCloudinary(file, "vr_room_images"))
        );
      } catch (error) {
        console.error("VR image upload failed:", error);
        vrImageUrls = []; // Continue without VR images
      }
    }

    // Create new room document
    const newRoom = new Room({
      name,
      price: Number(price),
      size: Number(size),
      category,
      location,
      bedrooms, // Keep as string since schema expects enum values
      bathrooms, // Keep as string since schema expects enum values
      kitchen, // Keep as string since schema expects enum values
      faced,
      parking, // Keep as string since schema expects enum values
      balcony,
      amenities: Array.isArray(amenities) 
        ? amenities 
        : (amenities ? amenities.split(',').map(item => item.trim()) : []),
      description: description || "",
      location,
      coordinates: {
        lat: parseFloat(parsedCoordinates.lat) || 0,
        lng: parseFloat(parsedCoordinates.lng) || 0,
      },
      roomImages: roomImageUrls,
      vrImages: vrImageUrls,
      owner: new mongoose.Types.ObjectId(owner),
    });

    // Save to database
    await newRoom.save();

    // Return success response
    return res.status(201).json({
      success: true,
      message: "Room created successfully",
      data: newRoom
    });

  } catch (error) {
    console.error("Error in createRoom:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const getRoomsByOwner = async (req, res) => {
  try {
    const ownerId = req.params.ownerId;

    // Validate owner ID
    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid owner ID format"
      });
    }

    // Find rooms with pagination
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [rooms, total] = await Promise.all([
      Room.find({ owner: ownerId })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Room.countDocuments({ owner: ownerId })
    ]);

    if (!rooms || rooms.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No rooms found for this owner",
        ownerId
      });
    }

    return res.status(200).json({
      success: true,
      data: rooms,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        limit: Number(limit)
      }
    });

  } catch (error) {
    console.error("Error in getRoomsByOwner:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const SearchRoom = async (req, res) => {
  try {
    const { price, location } = req.query;

    const searchCriteria = {};

    if (price) {
      searchCriteria.price = { $lte: parseFloat(price) };
    }

    if (location) {
      searchCriteria.location = { $regex: location, $options: "i" };
    }

    console.log("Search Criteria:", searchCriteria);

    const rooms = await Room.find(searchCriteria);

    res.status(200).json({ success: true, rooms });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateRoomStatus = async (req, res) => {
  try {
    const { id, userId } = req.params;
    console.log("Params:" , req.params);

    const { available } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid room ID" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      id,
      {
        available,
        bookedBy: userId
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedRoom) {
      return res.status(404).json({ message: "Room not found" });
    }

    return res.status(200).json({
      message: "Room status updated successfully",
      room: updatedRoom
    });

  } catch (error) {
    console.error("Error updating room status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const getRoomsBookedByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid user ID format" 
      });
    }

    // Find rooms where bookedBy matches the user ID
    const bookedRooms = await Room.find({ 
      bookedBy: new mongoose.Types.ObjectId(userId) 
    })
    .populate('bookedBy', 'name email profilePicture') // Include user details
    .populate('owner', 'name email') // Include owner details
    .sort({ updatedAt: -1 }); // Sort by most recently booked first

    if (!bookedRooms || bookedRooms.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No rooms booked by this user",
        data: []
      });
    }

    return res.status(200).json({
      success: true,
      message: "Successfully retrieved booked rooms",
      count: bookedRooms.length,
      data: bookedRooms
    });

  } catch (error) {
    console.error("Error fetching booked rooms:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Create a review
export const createReview = async (req, res) => {
  try {
    const { userId, comment, rating } = req.body;
    const roomId = req.params.roomId;

    // Ensure userId and roomId are valid ObjectIds
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({ message: "Invalid User or Room ID" });
    }

    // Create the new review
    const newReview = new Review({
      user: userId,  // Assuming the user is referenced by 'user' in the review model
      room: roomId,  // Assuming room is referenced by 'room' in the review model
      comment,
      rating,
    });

    // Save the review
    await newReview.save();

    // Optionally, you can push the review to the room's review array (if that's part of your schema)
    const room = await Room.findById(roomId);
    room.reviews.push(newReview._id);
    await room.save();

    return res.status(200).json({ success: true, review: newReview });
  } catch (err) {
    console.error("Error creating review:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Get all reviews of a room
export const getRoomReviews = async (req, res) => {
  try {
    const { roomId } = req.params;

    // Validate roomId
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({ message: "Invalid Room ID" });
    }

    // Find the room and populate the reviews
    const room = await Room.findById(roomId).populate("reviews", "user comment rating");  // Assuming 'reviews' is an array of review IDs

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Send the reviews
    res.status(200).json({ success: true, reviews: room.reviews });
  } catch (error) {
    console.error("Error in getRoomReviews:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
