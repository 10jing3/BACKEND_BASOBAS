import Room, { Review } from "../models/room.model.js";
import mongoose, { get } from "mongoose";
import Booking from "../models/booking.model.js";
import cloudinary from "./../config/cloudinary.config.js";
import { getUserName } from "./user.controller.js";
// Import the email utility
import transporter from "../utils/email.js";

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
      keepExistingImages = 'true',
      keepExistingVRImages = 'true'
    } = req.body;

    // Parse amenities to always be an array
let parsedAmenities = [];
if (Array.isArray(amenities)) {
  parsedAmenities = amenities;
} else if (typeof amenities === "string") {
  try {
    parsedAmenities = JSON.parse(amenities);
  } catch {
    parsedAmenities = [];
  }
}

    // Parse deleted images arrays from form-data (JSON string)
    const deletedImages = req.body.deletedImages ? JSON.parse(req.body.deletedImages) : [];
    const deletedVRImages = req.body.deletedVRImages ? JSON.parse(req.body.deletedVRImages) : [];

    const files = req.files || {};
    const newRoomImages = files['roomImages'] || [];
    const newVRImages = files['vrImages'] || [];

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
    


    // Upload new images if provided
    const uploadToCloudinary = async (file, folder) => {
      const result = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
        { folder }
      );
      return result.secure_url;
    };

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

    // Remove deleted images from existing arrays
    let filteredRoomImages = existingRoom.roomImages.filter(
      img => !deletedImages.includes(img)
    );
    let filteredVRImages = existingRoom.vrImages.filter(
      img => !deletedVRImages.includes(img)
    );

    // Prepare final image arrays
    const finalRoomImages = [
      ...(keepExistingImages === 'true' ? filteredRoomImages : []),
      ...newRoomImageUrls
    ];

    const finalVRImages = [
      ...(keepExistingVRImages === 'true' ? filteredVRImages : []),
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
        amenities: parsedAmenities.length > 0
  ? parsedAmenities.filter(a => a && a.trim() !== "")
  : existingRoom.amenities,
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

export const deleteRoomImages = async (req, res) => {
  try {
    const { id } = req.params;
    const { indexes, type } = req.body; // type: "roomImages" or "vrImages"

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid room ID" });
    }

    if (!["roomImages", "vrImages"].includes(type)) {
      return res.status(400).json({ message: "Invalid image type" });
    }

    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (!Array.isArray(indexes)) {
      return res.status(400).json({ message: "Indexes should be an array of numbers" });
    }

    // Sort indexes descending to avoid messing up positions while deleting
    const sortedIndexes = indexes.sort((a, b) => b - a);

    // Remove images at specified indexes from the correct array
    for (const index of sortedIndexes) {
      if (type === "roomImages" && index >= 0 && index < room.roomImages.length) {
        room.roomImages.splice(index, 1);
      }
      if (type === "vrImages" && index >= 0 && index < room.vrImages.length) {
        room.vrImages.splice(index, 1);
      }
    }

    await room.save();

    res.status(200).json({ 
      message: "Images deleted successfully", 
      data: type === "roomImages" ? room.roomImages : room.vrImages 
    });
  } catch (error) {
    console.error("Error deleting room images:", error);
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
    // Only fetch rooms where available is true
    // const rooms = await Room.find({ available: true });
    const rooms = await Room.find({ available: true, status: "approved" });
    res.status(200).json(rooms);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllRoomsAdmin = async (req, res) => {
  try {
    const rooms = await Room.find({status: "approved"});
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

    // Find the room by ID and status approved
    const room = await Room.findOne({ _id: id, status: "approved" });

    if (!room) {
      return res.status(404).json({ message: "Room not found or not approved" });
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

    // Parse amenities to always be an array
    let parsedAmenities = [];
    if (Array.isArray(amenities)) {
      parsedAmenities = amenities;
    } else if (typeof amenities === "string") {
      try {
        parsedAmenities = JSON.parse(amenities);
      } catch {
        parsedAmenities = [];
      }
    }

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
      }
    }

    // Handle file uploads

    const files = req.files || {};
    const roomImages = files['roomImages'] || [];
    const vrImages = files['vrImages'] || [];
    const documentImages = files['documentImages'] || [];

    // Validate at least one room image and one document image
    if (!roomImages || roomImages.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "At least one room image is required" 
      });
    }
    if (!documentImages || documentImages.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "At least one document image is required" 
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
        vrImageUrls = [];
      }
    }

    // Process document images
    const documentImageUrls = await Promise.all(
      documentImages.map(file => uploadToCloudinary(file, "room_documents"))
    );

    // Create new room document
    const newRoom = new Room({
      name,
      price: Number(price),
      size: Number(size),
      category,
      location,
      bedrooms,
      bathrooms,
      kitchen,
      faced,
      parking,
      balcony,
      amenities: parsedAmenities.filter(a => a && a.trim() !== ""),
      description: description || "",
      location,
      coordinates: {
        lat: parseFloat(parsedCoordinates.lat) || 0,
        lng: parseFloat(parsedCoordinates.lng) || 0,
      },
      roomImages: roomImageUrls,
      vrImages: vrImageUrls,
      documentImages: documentImageUrls, // <-- Save document image URLs
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

    // Find rooms with pagination, only status: "approved"
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = { owner: ownerId, status: "approved" };

    const [rooms, total] = await Promise.all([
      Room.find(query)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Room.countDocuments(query)
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
    const { price, minBudget, maxBudget, location, bedrooms, category } = req.query;

    const searchCriteria = {
            available: true 
    };

    // Price range support
    if (minBudget && maxBudget) {
      searchCriteria.price = { $gte: parseFloat(minBudget), $lte: parseFloat(maxBudget) };
    } else if (price) {
      searchCriteria.price = { $lte: parseFloat(price) };
    }

    // Location (case-insensitive partial match)
    if (location) {
      searchCriteria.location = { $regex: location, $options: "i" };
    }

    // Bedrooms (exact match)
    if (bedrooms) {
      searchCriteria.bedrooms = bedrooms;
    }

    // Category (exact match)
    if (category) {
      searchCriteria.category = category;
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
    .populate('bookedBy', 'username email profilePicture') // Include user details
    .populate('owner', 'username phone email') // Include owner details
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
    const username = await getUserName(userId);
    console.log("Username:", username);
    const newReview = new Review({
      user: userId,
      username,  // Assuming the user is referenced by 'user' in the review model
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
      const room = await Room.findById(roomId).populate({
      path: "reviews",
      select: "user username comment rating ",
    });

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

export const getRoomsOwnedAndBooked = async (req, res) => {
  try {
    const { ownerId } = req.params;

    // Validate owner ID
    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid owner ID format"
      });
    }

    // Find all rooms owned by this user, and populate bookedBy user info
    const rooms = await Room.find({ owner: ownerId })
      .populate('bookedBy', 'name username email phone profilePicture')
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Rooms owned by user with booking info",
      data: rooms
    });
  } catch (error) {
    console.error("Error fetching owned rooms with bookings:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

// Remove a booking by booking ID (for room owner)
export const removeBooking = async (req, res) => {
  try {
    const bookingId = req.params.bookingId; // <-- Use bookingId from params

    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    // Optionally: Check if the current user is the owner of the room
    // (Assuming req.user is set by auth middleware)
    // const room = await Room.findById(booking.room);
    // if (!room || room.owner.toString() !== req.user.id) {
    //   return res.status(403).json({ message: "Not authorized." });
    // }

    // Remove the booking
    await Booking.findByIdAndDelete(bookingId);

    res.json({ success: true, message: "Booking removed successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove booking." });
  }
};
export const getPendingRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ status: "pending" });
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};



export const approveRoom = async (req, res) => {
  try {
    const { id } = req.params;
    // Find the room and update status to approved
    const room = await Room.findByIdAndUpdate(
      id,
      { status: "approved" },
      { new: true }
    ).populate("owner");
    if (!room) return res.status(404).json({ message: "Room not found" });
    if (room.status !== "approved") {
      return res.status(400).json({ message: "Room is not approved" });
    }
    // Send approval email to owner
    if (room.owner && room.owner.email) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: room.owner.email,
        subject: "Your Room Has Been Approved",
       text: `Hello ${room.owner.name || room.owner.username || ""},\n\nYour room "${room.name}" has been approved and is now live on BASOBAS.\n\nPlease go to 'My Rooms' in your dashboard to manage your room.\n\nThank you!`,
      });
    }
    res.status(200).json(room);
  } catch (error) {
    console.error("Error in approveRoom:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Reject Room (DELETE /api/room/reject/:id)
export const rejectRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findById(id).populate("owner");
    if (!room) return res.status(404).json({ message: "Room not found" });

    // Send rejection email to owner
    if (room.owner && room.owner.email) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: room.owner.email,
        subject: "Your Room Listing Was Rejected",
        text: `Hello ${room.owner.name || room.owner.username || ""},\n\nWe're sorry, but your room "${room.name}" was not approved and has been removed from BASOBAS.\n\nIf you have questions, please contact support.`,
      });
    }

    await Room.findByIdAndDelete(id);
    res.status(200).json({ message: "Room deleted" });
  } catch (error) {
    console.error("Error in rejectRoom:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
