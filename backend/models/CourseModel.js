import mongoose from "mongoose";
// Define Lecture Schema (sub-document)
const lectureSchema = mongoose.Schema({
    title: { type: String, required: true },
    video_url: { type: String, required: true },
    duration: { type: Number, required: true, default: 0 }, 
    is_preview_free: { type: Boolean, default: false }
}, ); 

// Define Chapter Schema (sub-document)
const chapterSchema = mongoose.Schema({
    title: { type: String, required: true },
    lectures: [lectureSchema] 
},); 

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    educator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: { type: String },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    price: { 
      type: Number,
      required: true,
      default: 0, // Set a default for free courses
      min: 0,
      max: 10000, 
    },
    level: { 
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    thumbnail: { 
      type: String,
      trim: true,
      default: 'https://via.placeholder.com/400x200?text=Course+Thumbnail', // Placeholder image
    },
       chapters: [chapterSchema], 
    duration: { 
        type: Number,
        default: 0
    },
    tags: {
      type: [String],
      default: [],
    },
    contentLinks: { 
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['Draft', 'Pending Review', 'Published', 'Archived'],
      default: 'Draft',
    },
    is_featured: {
      type: Boolean,
      default: false,
    },
    total_enrollments: { 
            type: Number,
            default: 0,
        },
     ratingsAverage: {
            type: Number,
            default: 0,
            min: [0, 'Rating must be above 0'],
            max: [5, 'Rating must be below 5.0'],
            set: val => Math.round(val * 10) / 10
        },
        ratingsQuantity: {
            type: Number,
            default: 0
        },
        viewsCount: {
            type: Number,
            default: 0,
        },
        recommendationScore: { type: Number, default: 0 },
        keywords: { type: [String], default: [] } 

  },
  { timestamps: true } 
);

const Course = mongoose.model("Course", courseSchema);
export default Course;