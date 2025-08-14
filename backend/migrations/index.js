// // backend/migrations/addTotalEnrollments.js
// import dotenv from 'dotenv';
// import mongoose from 'mongoose';
// import Course from '../models/CourseModel.js';

// dotenv.config();

// const connectDB = async () => {   try{

//         const conn = await mongoose.connect("mongodb+srv://ahodokpojeffery:iByrYfY6HgwpYw4G@lecturematecluster.mbhc4ut.mongodb.net/LectureMate?retryWrites=true&w=majority&appName=LECTUREMATECLUSTER");
//         console.log(`MongoDB Connected: ${conn.connection.host}`);

//     } catch (error) {
// console.error(`Error: ${error.message}`);
// process.exit(1);
//     }};

// const addTotalEnrollments = async () => {
//   await connectDB();
//   try {
//     console.log('Adding total_enrollments field to courses...');
//     const result = await Course.updateMany(
//       { total_enrollments: { $exists: false } },
//       { $set: { total_enrollments: 0 } }
//     );
//     console.log(`${result.modifiedCount} courses updated with total_enrollments: 0.`);
//     console.log('Migration completed!');
//   } catch (error) {
//     console.error('Error during migration:', error);
//   } finally {
//     mongoose.disconnect();
//   }
// };

// addTotalEnrollments();


// backend/migrate_db_fields.js

// backend/migrate_db_fields.js



// backend/migrate_db_fields.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/UserModel.js';
import Course from '../models/CourseModel.js';

dotenv.config(); // Load environment variables from .env file

const MONGODB_URI = process.env.MONGO_URI; // Ensure your .env has MONGO_URI

if (!MONGODB_URI) {
  console.error("Error: MONGO_URI is not defined in your .env file.");
  process.exit(1);
}

const migrate = async () => {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      // These options are deprecated in Mongoose v6+ but included for broader compatibility
      // You can safely remove them if you're on a recent Mongoose version (6.x or 7.x)
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });
    console.log('MongoDB connected for migration.');

    // 2. Migrate User Model fields
    console.log('Migrating User model...');
    const userResult = await User.updateMany(
      {
        $or: [
          { activityHistory: { $exists: false } },
          { preferredCategories: { $exists: false } },
          { preferredLevels: { $exists: false } }
        ]
      },
      {
        $set: {
          activityHistory: [], // Set to empty array if missing
          preferredCategories: [], // Set to empty array if missing
          preferredLevels: [] // Set to empty array if missing
        }
      }
    );
    // Use `modifiedCount` for modern Mongoose, fallback to `nModified` for older versions
    console.log(`User migration complete: ${userResult.modifiedCount !== undefined ? userResult.modifiedCount : userResult.nModified} documents modified.`);

    // 3. Migrate Course Model fields
    console.log('Migrating Course model...');
    const courseResult = await Course.updateMany(
      {
        $or: [
          { recommendationScore: { $exists: false } },
          { keywords: { $exists: false } }
        ]
      },
      {
        $set: {
          recommendationScore: 0, // Set to default 0 if missing
          keywords: [] // Set to empty array if missing
        }
      }
    );
    // Use `modifiedCount` for modern Mongoose, fallback to `nModified` for older versions
    console.log(`Course migration complete: ${courseResult.modifiedCount !== undefined ? courseResult.modifiedCount : courseResult.nModified} documents modified.`);

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1); // Exit with an error code
  } finally {
    // 4. Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
    process.exit(0); // Exit successfully
  }
};

migrate();

