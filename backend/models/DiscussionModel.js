import mongoose from 'mongoose';

// Define a schema for comments within a discussion post
const commentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, 'Comment cannot be empty!']
    },
    user: { // Reference to the User who made the comment
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Comment must belong to a user.']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Discussion Schema
const discussionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'A discussion must have a title.'],
        trim: true,
        maxlength: [100, 'A discussion title must have less than or equal to 100 characters.']
    },
    content: {
        type: String,
        required: [true, 'A discussion must have content.']
    },
    user: { // Reference to the User who created the discussion topic
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Discussion must belong to a user.']
    },
    course: { // Mandatory: Link to a specific course
        type: mongoose.Schema.ObjectId,
        ref: 'Course',
        required: [true, 'Discussion must belong to a course.']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    // Embedded comments
    comments: [commentSchema]
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Index for efficient querying by course and creation date
discussionSchema.index({ course: 1, createdAt: -1 });

// Populate user and course details when querying discussions and comments
discussionSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'user',
        select: 'name email role' // Only select relevant user fields
    }).populate({
        path: 'course',
        select: 'title' // Only select course title
    }).populate({
        path: 'comments.user',
        select: 'name email role'
    });
    next();
});

const Discussion = mongoose.model('Discussion', discussionSchema);

export default Discussion;
