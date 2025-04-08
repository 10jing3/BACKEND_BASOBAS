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
    const currentUser = await User.findById(req.params.id);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const users = await User.find({ _id: { $ne: currentUser._id } });

    const matches = users.map((user) => {
      const score = calculateMatchScore(currentUser, user);
      return { 
        _id: user._id,
        name: user.username,
        image:user.profilePicture,
        email: user.email,
        phone:user.phone,
        gender: user.gender,
        budget: user.budget,
        cleanliness: user.cleanliness,
        isSmoker: user.isSmoker,
        isPetFriendly: user.isPetFriendly,
        matchScore: score
      };
    });

    const sortedMatches = matches.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json(sortedMatches);
  } catch (err) {
    res.status(500).json({ message: "Error finding matches", error: err.message });
  }
};
