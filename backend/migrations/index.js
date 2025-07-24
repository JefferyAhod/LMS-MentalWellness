// backend/migrations/addTotalEnrollments.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Course from '../models/CourseModel.js';

dotenv.config();

const connectDB = async () => {   try{

        const conn = await mongoose.connect("mongodb+srv://ahodokpojeffery:iByrYfY6HgwpYw4G@lecturematecluster.mbhc4ut.mongodb.net/LectureMate?retryWrites=true&w=majority&appName=LECTUREMATECLUSTER");
        console.log(`MongoDB Connected: ${conn.connection.host}`);

    } catch (error) {
console.error(`Error: ${error.message}`);
process.exit(1);
    }};

const addTotalEnrollments = async () => {
  await connectDB();
  try {
    console.log('Adding total_enrollments field to courses...');
    const result = await Course.updateMany(
      { total_enrollments: { $exists: false } },
      { $set: { total_enrollments: 0 } }
    );
    console.log(`${result.modifiedCount} courses updated with total_enrollments: 0.`);
    console.log('Migration completed!');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    mongoose.disconnect();
  }
};

addTotalEnrollments();