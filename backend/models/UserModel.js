import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import crypto from "crypto";

// Define a simple schema for general user activities
// This is separate from the studentProfile's detailed course activity.
const userActivitySchema = mongoose.Schema({
  action: { type: String, required: true }, // e.g., "Register", "Login", "Logout", "Onboarding"
  description: { type: String }, // Additional details about the action
  date: { type: Date, default: Date.now }, // When the activity occurred
  // You can add other fields here if needed, like 'ipAddress', 'deviceInfo', etc.
});

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      trim: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      minLength: [8, "Password must be at least 8 characters"],
    },
    role: {
      type: String,
      default: "staff",
      enum: ["student", "educator", "admin"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved"
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    onboardingCompleted: { 
      type: Boolean,
      default: false
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    // Add the activityHistory field to the User model
    activityHistory: {
      type: [userActivitySchema], // Array of the new userActivitySchema
      default: [], // Ensure it defaults to an empty array
    },
    preferredCategories: { // This seems to belong to User or StudentProfile based on context
      type: [String],
      default: []
    },
    preferredLevels: { // This also seems to belong to User or StudentProfile based on context
      type: [String],
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: []
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create reset token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto.createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model("User", userSchema);
export default User;
