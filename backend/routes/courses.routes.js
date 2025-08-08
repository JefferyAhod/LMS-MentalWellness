import express from "express";
import { getAllCourses, getCourseById, getFeaturedCourses, getRecommendedCourses } from "../controllers/courseController.js";

const coursesRouter = express.Router();

coursesRouter.route("/featured").get(getFeaturedCourses);
coursesRouter.route("/recommended").get(getRecommendedCourses);
coursesRouter.route("/").get(getAllCourses);

coursesRouter.route("/:id").get(getCourseById);




export default coursesRouter;
