import mongoose from 'mongoose';

const moodEntrySchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', 
    },
    mood: {
      type: String,
      required: true,
      enum: ['very_happy', 'happy', 'neutral', 'sad', 'very_sad'], 
      default: 'neutral'
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot be more than 500 characters.'],
      trim: true,
    },
    date: {
      type: String, 
      required: true,
      unique: [true, 'Only one mood entry per day is allowed for a user.'] 
    },
  },
  {
    timestamps: true, 
  }
);

// Add a compound unique index to ensure a user can only have one mood entry per day
moodEntrySchema.index({ user: 1, date: 1 }, { unique: true });

const MoodEntry = mongoose.model('MoodEntry', moodEntrySchema);

export default MoodEntry;
