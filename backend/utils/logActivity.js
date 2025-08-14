import User from "../models/UserModel.js";

export const logActivity = async (userId, action, description) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    user.activityHistory.push({
      action,
      description,
      date: new Date(),
    });

    await user.save();
  } catch (err) {
    console.error("Failed to log activity:", err.message);
  }
};
