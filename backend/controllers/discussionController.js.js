import Discussion from '../models/DiscussionModel.js';
import AppError from '../utils/appError.js';
import asyncHandler from 'express-async-handler';
import APIFeatures from '../utils/apiFeatures.js';
import mongoose from 'mongoose';

// Get all discussion topics (can be filtered by courseId)
export const getAllDiscussions = asyncHandler(async (req, res, next) => {
    let initialFilter = {};
    let queryParams = { ...req.query }; // Create a copy of req.query for APIFeatures

    if (req.query.courseId) {
        // 1. Validate if the provided courseId is a valid MongoDB ObjectId format
        if (!mongoose.Types.ObjectId.isValid(req.query.courseId)) {
            console.error(`Invalid Course ID format received: ${req.query.courseId}`);
            return next(new AppError('Invalid Course ID format provided.', 400));
        }
        // 2. Apply the course filter directly using ObjectId
        initialFilter = { course: new mongoose.Types.ObjectId(req.query.courseId) };
        
        // 3. IMPORTANT: Remove courseId from queryParams so APIFeatures doesn't re-process it incorrectly
        delete queryParams.courseId; 
    }


    try {
        // Start the Mongoose query with the initialFilter
        const query = Discussion.find(initialFilter);

        // Apply API features (sorting, limiting, pagination)
        // We now pass queryParams without courseId to APIFeatures
        const features = new APIFeatures(query, queryParams)
            .filter() // This filter method in APIFeatures will now process other general filters
            .sort()
            .limitFields()
            .paginate();

        const discussions = await features.query;

        res.status(200).json({
            status: 'success',
            results: discussions.length,
            data: {
                discussions
            }
        });
    } catch (err) {
        console.error('Backend: Error fetching discussions:', err);
        return next(new AppError('Failed to fetch discussions due to server error.', 500));
    }
});

// Get a single discussion topic by ID
export const getDiscussion = asyncHandler(async (req, res, next) => {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
        return next(new AppError('No discussion found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            discussion
        }
    });
});

// Create a new discussion topic
export const createDiscussion = asyncHandler(async (req, res, next) => {
    // Ensure the discussion is associated with the logged-in user
    req.body.user = req.user.id; 
    // Ensure the discussion is linked to a course
    // If you always create from a CourseDetail page, courseId will be in body
    if (!req.body.course) {
        return next(new AppError('A discussion must be linked to a course.', 400));
    }

    const newDiscussion = await Discussion.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            discussion: newDiscussion
        }
    });
});

// Add a comment to a specific discussion topic
export const addCommentToDiscussion = asyncHandler(async (req, res, next) => {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
        return next(new AppError('No discussion topic found with that ID', 404));
    }

    // Ensure the comment is associated with the logged-in user
    const newComment = {
        text: req.body.text,
        user: req.user.id
    };

    discussion.comments.push(newComment);
    await discussion.save(); // Save the updated discussion with the new comment

    // Re-populate the user for the newly added comment before sending response
    const updatedDiscussion = await Discussion.findById(req.params.id);

    res.status(201).json({
        status: 'success',
        data: {
            discussion: updatedDiscussion // Send the updated discussion with populated comment user
        }
    });
});

// Update a discussion topic (only by owner or admin)
export const updateDiscussion = asyncHandler(async (req, res, next) => {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
        return next(new AppError('No discussion topic found with that ID', 404));
    }

    // Authorization: Only the owner or an admin can update
    // Compare IDs as strings
    if (discussion.user.id.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
        return next(new AppError('You do not have permission to update this discussion.', 403));
    }

    // Allow updating title and content
    discussion.title = req.body.title || discussion.title;
    discussion.content = req.body.content || discussion.content;

    await discussion.save({ validateBeforeSave: true }); // Ensure validation runs

    res.status(200).json({
        status: 'success',
        data: {
            discussion
        }
    });
});

// Delete a discussion topic (only by owner or admin)
export const deleteDiscussion = asyncHandler(async (req, res, next) => {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
        return next(new AppError('No discussion topic found with that ID', 404));
    }

    // Authorization: Only the owner or an admin can delete
    // Compare IDs as strings
    if (discussion.user.id.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
        return next(new AppError('You do not have permission to delete this discussion.', 403));
    }

    await Discussion.findByIdAndDelete(req.params.id); // Use findByIdAndDelete for Mongoose 6+

    res.status(204).json({ // 204 No Content for successful deletion
        status: 'success',
        data: null
    });
});
