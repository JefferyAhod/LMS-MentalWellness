// cleanupEnrollments.js

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js'; // Adjust path as needed
import Enrollment from '../models/EnrollmentModel.js'; // Adjust path as needed
import User from '../models/UserModel.js'; // Adjust path as needed

// --- FIX: Specify the path to your .env file ---
// Assuming your .env is at the project root, and this script is in backend/script
dotenv.config({ path: '../.env' }); 
// --- END FIX ---

/**
 * Script to identify and optionally delete Enrollment documents
 * that have invalid (dangling) or null/undefined user references.
 * This helps maintain data integrity and prevent errors in your application.
 *
 * !!! IMPORTANT: BACK UP YOUR DATABASE BEFORE RUNNING THIS SCRIPT !!!
 * This script will DELETE data if run with the --delete flag.
 */

const cleanupEnrollments = async (shouldDelete) => {
    // Ensure MONGO_URI is now loaded before attempting to connect
    if (!process.env.MONGO_URI) {
        console.error('ERROR: MONGO_URI is not defined in the .env file or the .env file path is incorrect.');
        process.exit(1); // Exit with an error code
    }

    await connectDB();
    console.log('MongoDB Connected for cleanup script.');

    try {
        // --- Step 1: Find enrollments where the 'user' field is null or undefined ---
        console.log('\n--- Checking for Enrollments with NULL/UNDEFINED User References ---');
        const nullUserEnrollments = await Enrollment.find({
            user: { $in: [null, undefined] }
        });

        if (nullUserEnrollments.length > 0) {
            console.warn(`Found ${nullUserEnrollments.length} Enrollment(s) with NULL/UNDEFINED user references:`);
            nullUserEnrollments.forEach(enrollment => console.log(`  - ID: ${enrollment._id}, Course: ${enrollment.course}`));
            
            if (shouldDelete) {
                console.log('Attempting to delete these enrollments...');
                const deleteResult = await Enrollment.deleteMany({
                    user: { $in: [null, undefined] }
                });
                console.log(`Successfully deleted ${deleteResult.deletedCount} Enrollment(s) with NULL/UNDEFINED user references.`);
            } else {
                console.info('To delete these enrollments, run the script with --delete flag.');
            }
        } else {
            console.log('No Enrollments found with NULL/UNDEFINED user references. ✨');
        }

        // --- Step 2: Find enrollments where the 'user' field references a non-existent User document ---
        console.log('\n--- Checking for Enrollments with DANGLING User References ---');
        
        // Aggregate to find enrollments whose 'user' ObjectId does not match any '_id' in the 'users' collection
        const danglingUserEnrollments = await Enrollment.aggregate([
            {
                $lookup: {
                    from: User.collection.name, // Use the actual collection name from the User model
                    localField: 'user',
                    foreignField: '_id',
                    as: 'userDocs'
                }
            },
            {
                $match: {
                    // Filter for documents where the lookup result is an empty array, meaning no matching user was found
                    userDocs: { $eq: [] }
                }
            },
            {
                $project: { // Project only necessary fields
                    _id: 1,
                    course: 1,
                    user: 1 // Keep the dangling user ID for inspection
                }
            }
        ]);

        if (danglingUserEnrollments.length > 0) {
            console.warn(`Found ${danglingUserEnrollments.length} Enrollment(s) with DANGLING user references:`);
            danglingUserEnrollments.forEach(enrollment => console.log(`  - ID: ${enrollment._id}, User ID (dangling): ${enrollment.user}, Course: ${enrollment.course}`));

            if (shouldDelete) {
                console.log('Attempting to delete these enrollments...');
                const idsToDelete = danglingUserEnrollments.map(doc => doc._id);
                const deleteResult = await Enrollment.deleteMany({ _id: { $in: idsToDelete } });
                console.log(`Successfully deleted ${deleteResult.deletedCount} Enrollment(s) with DANGLING user references.`);
            } else {
                console.info('To delete these enrollments, run the script with --delete flag.');
            }
        } else {
            console.log('No Enrollments found with DANGLING user references. 🎉');
        }

    } catch (error) {
        console.error('An error occurred during cleanup:', error);
    } finally {
        mongoose.disconnect();
        console.log('MongoDB connection closed.');
    }
};

// --- Execution ---
const args = process.argv.slice(2);
const shouldDelete = args.includes('--delete');

console.log(`\nStarting Enrollment cleanup script (Delete mode: ${shouldDelete ? 'ON' : 'OFF'})...`);
cleanupEnrollments(shouldDelete);
