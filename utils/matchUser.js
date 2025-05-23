export const calculateMatchScore = (userA, userB) => {
  let score = 0;
  let maxScore = 0;

  // Gender preference match (20)
  maxScore += 20;
  if (
    userA.preferredRoommateGender === "any" ||
    userA.preferredRoommateGender === userB.gender
  ) {
    score += 20;
  }

  // Budget range match (±5000) (20)
  maxScore += 20;
  if (
    typeof userA.budget === "number" &&
    typeof userB.budget === "number" &&
    Math.abs(userA.budget - userB.budget) <= 5000
  ) {
    score += 20;
  }

  // Cleanliness (±1) (15)
  maxScore += 15;
  if (
    typeof userA.cleanliness === "number" &&
    typeof userB.cleanliness === "number" &&
    Math.abs(userA.cleanliness - userB.cleanliness) <= 1
  ) {
    score += 15;
  }

  // Age similarity (±3 years) (10)
  maxScore += 10;
  if (
    typeof userA.age === "number" &&
    typeof userB.age === "number" &&
    Math.abs(userA.age - userB.age) <= 3
  ) {
    score += 10;
  }

  // Pet-friendly (10)
  maxScore += 10;
  if (
    typeof userA.isPetFriendly === "boolean" &&
    typeof userB.isPetFriendly === "boolean" &&
    userA.isPetFriendly === userB.isPetFriendly
  ) {
    score += 10;
  }

  // Smoker (10)
  maxScore += 10;
  if (
    typeof userA.isSmoker === "boolean" &&
    typeof userB.isSmoker === "boolean" &&
    userA.isSmoker === userB.isSmoker
  ) {
    score += 10;
  }

  // Hobbies intersection (up to 15, 5 per common hobby, max 3)
  maxScore += 15;
  const hobbiesA = new Set(userA.hobbies || []);
  const hobbiesB = new Set(userB.hobbies || []);
  const commonHobbies = [...hobbiesA].filter((h) => hobbiesB.has(h));
  score += Math.min(commonHobbies.length, 3) * 5;

  // Normalize to percentage (optional)
  const percentScore = Math.round((score / maxScore) * 100);

  return percentScore;
};