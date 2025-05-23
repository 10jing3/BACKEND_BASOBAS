import User from "../models/user.model.js";
import { calculateMatchScore } from "../utils/matchUser.js";

// Match based on filters (strict match)
export const matchRoommates = async (req, res) => {
  const { gender, budget, cleanliness, isSmoker, isPetFriendly } = req.body;

  try {
    const query = {
      ...(gender && { gender }),
      ...(budget !== undefined && {
        budget: { $lte: budget + 100, $gte: budget - 100 },
      }),
      ...(cleanliness !== undefined && {
        cleanliness: { $gte: cleanliness - 1, $lte: cleanliness + 1 },
      }),
      ...(isSmoker !== undefined && { isSmoker }),
      ...(isPetFriendly !== undefined && { isPetFriendly }),
    };

    const potentialMatches = await User.find(query);

    res.status(200).json(potentialMatches);
  } catch (error) {
    res.status(500).json({ message: "Error finding matches", error });
  }
};

// Match based on score (ranking users)
export const getRoommateMatches = async (req, res) => {
  try {
    // 1. Find the current user
    const currentUser = await User.findById(req.params.id);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. If current user has matching disabled, return empty array
    if (currentUser.matchingEnabled === false) {
      return res.status(200).json([]);
    }

   // 3. Find other users who also have matching enabled, except current user and admin
const users = await User.find({
  matchingEnabled: true,
  _id: { $ne: currentUser._id },
  role: { $ne: "admin" } // adjust field name if your role field is different
});
    // 4. Calculate match scores
    const matches = users.map((user) => {
      const score = calculateMatchScore(currentUser, user);
      return {
        _id: user._id,
        name: user.username,
        image: user.profilePicture,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        age: user.age,
        budget: user.budget,
        cleanliness: user.cleanliness,
        isSmoker: user.isSmoker,
        isPetFriendly: user.isPetFriendly,
        hobbies: user.hobbies,
        bio: user.bio,
        matchScore: score
      };
    });

    // 5. Sort matches by score (descending)
    const sortedMatches = matches.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json(sortedMatches);
  } catch (err) {
    res.status(500).json({ message: "Error finding matches", error: err.message });
  }
};

export const updateMatchingEnabled = async (req, res) => {
  try {
    const { enabled } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { matchingEnabled: enabled },
      { new: true }
    );
    res.json({ success: true, matchingEnabled: user.matchingEnabled });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update matching status" });
  }
};

export const getMatchingEnabled = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ matchingEnabled: user.matchingEnabled });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch matching status" });
  }
};