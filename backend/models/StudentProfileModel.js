import mongoose from "mongoose";

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, 
    },
    university: {
      type: String,
      required: true,
      trim: true,
    },
    major: {
      type: String,
      required: true,
      trim: true,
    },
    semester: {
      type: String,
      enum: ["1", "2", "3", "4"],
      required: true,
    },
    studyStyle: {
      type: String,
      enum: ["individual", "group", "mixed"],
      required: true,
    },
    studyTime: {
      type: String,
      enum: [
        "early_morning",
        "morning",
        "afternoon",
        "evening",
        "night",
        "late_night",
      ],
      required: true,
    },
    learningStyles: {
      type: [String],
      enum: ["visual", "auditory", "reading", "kinesthetic"],
      default: [],
    },
    goals: {
      type: [String],
      enum: ["grades", "understanding", "time_mgmt", "exam_prep"],
      default: [],
    },
    disciplines: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const StudentProfile = mongoose.model("StudentProfile", studentProfileSchema);
export default StudentProfile;
