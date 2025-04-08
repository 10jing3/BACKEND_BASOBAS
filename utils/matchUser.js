// utils/matchUsers.js
export const calculateMatchScore = (userA, userB) => {
  let score = 0;

  // Gender preference match
  if (
    userA.preferredRoommateGender === "any" ||
    userA.preferredRoommateGender === userB.gender
  )
    score += 20;

  // Budget range match (±100)
  if (
    userB.budget &&
    userA.budget &&
    Math.abs(userA.budget - userB.budget) <= 5000
  )
    score += 20;

  // Cleanliness (±1)
  if (
    userB.cleanliness &&
    userA.cleanliness &&
    Math.abs(userA.cleanliness - userB.cleanliness) <= 1
  )
    score += 15;

  // Pet-friendly & Smoker
  if (userA.isPetFriendly === userB.isPetFriendly) score += 10;
  if (userA.isSmoker === userB.isSmoker) score += 10;

  // Hobbies intersection
  const hobbiesA = new Set(userA.hobbies || []);
  const hobbiesB = new Set(userB.hobbies || []);
  const commonHobbies = [...hobbiesA].filter((h) => hobbiesB.has(h));
  score += commonHobbies.length * 5;

  return score;
};
