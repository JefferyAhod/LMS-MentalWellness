import mongoose from 'mongoose';

const reviewSchema = mongoose.Schema(
    {
        course: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, 'Review must belong to a course'],
            ref: 'Course',
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, 'Review must belong to a user'],
            ref: 'User',
        },
        rating: {
            type: Number,
            required: [true, 'A review must have a rating'],
            min: [1, 'Rating must be at least 1.0'],
            max: [5, 'Rating must be at most 5.0'],
            set: val => Math.round(val * 10) / 10 // Round to one decimal place
        },
        comment: {
            type: String,
            trim: true,
            maxlength: [500, 'Review comment cannot be more than 500 characters']
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Prevent a user from reviewing the same course multiple times
reviewSchema.index({ course: 1, user: 1 }, { unique: true });

// Static method to calculate average rating and number of reviews for a course
reviewSchema.statics.calcAverageRatings = async function(courseId) {
    const stats = await this.aggregate([
        {
            $match: { course: courseId }
        },
        {
            $group: {
                _id: '$course',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);

    // Update the Course model with calculated ratings
    if (stats.length > 0) {
        await mongoose.model('Course').findByIdAndUpdate(courseId, {
            ratingsAverage: stats[0].avgRating,
            ratingsQuantity: stats[0].nRating
        });
    } else {
        await mongoose.model('Course').findByIdAndUpdate(courseId, {
            ratingsAverage: 0,
            ratingsQuantity: 0
        });
    }
};

// Call calcAverageRatings after a review is saved/updated
reviewSchema.post('save', async function() {
    await this.constructor.calcAverageRatings(this.course);
});

// Call calcAverageRatings before a review is deleted
reviewSchema.pre('remove', async function(next) {
    await this.constructor.calcAverageRatings(this.course);
    next();
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
